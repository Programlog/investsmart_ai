import { NextRequest, NextResponse } from "next/server"
import type { PriceChange } from "@/types/stock"
const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY
const ALPACA_BASE_URL = "https://data.alpaca.markets/v2/stocks"

// Common headers for all Alpaca API requests
const ALPACA_HEADERS = {
    "APCA-API-KEY-ID": ALPACA_API_KEY || "",
    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY || "",
}
interface AlpacaBar {
    t: string; // RFC-3339 timestamp
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
}

interface ChartDataPoint {
    time: string;
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

/**
 * Computes the price change between the previous trading day's close and the latest price
 * @param bars Array of price bars sorted from oldest to newest
 * @returns Object with absoluteChange and percentChange values
 * @throws Error if there is insufficient data for calculation
 */
function computePriceChange(bars: AlpacaBar[]): PriceChange {
    // Need at least 1 bar
    if (!bars || bars.length === 0) {
        throw new Error("No data available for price change calculation");
    }

    // Get the latest bar (last in the array)
    const latestBar = bars[bars.length - 1];
    const currentPrice = latestBar.c;

    // If we only have one bar, use its opening price as reference
    if (bars.length === 1) {
        const absoluteChange = currentPrice - latestBar.o;
        const percentChange = (absoluteChange / latestBar.o) * 100;
        return {
            absoluteChange: parseFloat(absoluteChange.toFixed(2)),
            percentChange: parseFloat(percentChange.toFixed(2))
        };
    }

    // Get the previous bar's close price
    const previousBar = bars[bars.length - 2];
    const absoluteChange = currentPrice - previousBar.c;
    const percentChange = (absoluteChange / previousBar.c) * 100;

    return {
        absoluteChange: parseFloat(absoluteChange.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2))
    };
}

/**
 * Fetches the latest bar data for a stock
 * @param symbol Stock symbol to fetch
 * @returns Latest bar data with symbol, close price and timestamp
 */
async function fetchLatestBar(symbol: string) {
    const url = `${ALPACA_BASE_URL}/${encodeURIComponent(symbol)}/bars/latest?feed=iex`

    const res = await fetch(url, {
        headers: ALPACA_HEADERS,
        next: { revalidate: 30 },
    })

    if (!res.ok) {
        const errorBody = await res.text()
        console.error(`Alpaca latest bar API error for ${symbol}: ${res.status} ${res.statusText}`, errorBody)
        throw new Error(`Failed to fetch latest bar from Alpaca: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.bar || data.bar.c === undefined || data.bar.t === undefined) {
        console.error(`Invalid latest bar response for ${symbol}:`, data)
        throw new Error("Invalid latest bar response structure from Alpaca")
    }

    const { c: close, t: timestamp } = data.bar
    return {
        symbol,
        close,
        timestamp,
    }
}

/**
 * Fetches historical bars for a stock
 * @param symbol Stock symbol
 * @param params URLSearchParams with timeframe, limit, start, end
 * @returns Array of bar data or error
 */
async function fetchHistoricalBars(symbol: string, params: URLSearchParams) {
    const url = `${ALPACA_BASE_URL}/${encodeURIComponent(symbol)}/bars?${params.toString()}&adjustment=all&feed=iex`

    const res = await fetch(url, {
        headers: ALPACA_HEADERS,
        next: { revalidate: 15 },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error(`Alpaca bars API error for ${symbol}: ${res.status} ${res.statusText}`, err)
        throw new Error(err.message || `Failed to fetch bar data from Alpaca: ${res.statusText}`)
    }

    return await res.json()
}

/**
 * Handles the API request for stock data
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const type = searchParams.get("type")
    const timeframe = searchParams.get("timeframe") || "1Day"
    const limit = searchParams.get("limit") || "100"
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
    }

    try {
        // --- Handle 'latestBar' type request ---
        if (type === "latestBar") {
            const latestBar = await fetchLatestBar(symbol)

            // To calculate price change, we need enough historical data
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            const params = new URLSearchParams({
                timeframe: "1Day",
                limit: "10", // Increased limit to ensure we have enough data
                start: sevenDaysAgo.toISOString() // Always include a start date
            })

            if (end) params.append("end", end)

            try {
                const data = await fetchHistoricalBars(symbol, params)
                try {
                    const priceChange = computePriceChange(data.bars)
                    return NextResponse.json({
                        latestBar,
                        priceChange
                    })
                } catch (priceChangeError: unknown) {
                    const errorMessage = priceChangeError instanceof Error
                        ? priceChangeError.message
                        : 'Unknown error calculating price change';
                    console.warn(`Could not compute price change for ${symbol}: ${errorMessage}`)
                    return NextResponse.json({
                        latestBar,
                        priceChange: null
                    })
                }
            } catch (historyError) {
                return NextResponse.json({ latestBar })
            }
        }

        // --- Handle historical 'bars' request (default) ---
        const params = new URLSearchParams({ timeframe, limit })
        if (start) params.append("start", start)
        if (end) params.append("end", end)

        const data = await fetchHistoricalBars(symbol, params)

        // Transform the data into a more convenient format for the frontend
        const chartData: ChartDataPoint[] = (data.bars || []).map((bar: AlpacaBar) => ({
            time: bar.t,
            price: bar.c,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            volume: bar.v,
        }))

        let priceChange: PriceChange | null = null
        try {
            priceChange = computePriceChange(data.bars)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error calculating price change';
            console.warn(`Could not compute price change for ${symbol}: ${errorMessage}`)
        }

        return NextResponse.json({
            chartData,
            priceChange
        })

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error"
        console.error(`Error processing request for ${symbol}:`, error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
