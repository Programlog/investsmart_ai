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
 * @returns Object with absoluteChange and percentChange values, or error
 */
function computePriceChange(bars: AlpacaBar[]): PriceChange | { error: string } {
    // Need at least 2 bars from different days
    if (bars.length < 2) {
        return { error: "Insufficient data for price change calculation" };
    }

    // Get the latest bar (last in the array)
    const latestBar = bars[bars.length - 1];
    const currentPrice = latestBar.c;
    const currentDate = new Date(latestBar.t).toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Initialize variables for previous trading day
    let previousClose = null;
    
    // Walk backward through the array until we hit a bar from an earlier day
    for (let i = bars.length - 2; i >= 0; i--) {
        const barDate = new Date(bars[i].t).toISOString().split('T')[0];
        if (barDate !== currentDate) {
            // Skip any earlier bars on that same previousDate until
            // we hit the final (i.e., latest) one for that day
            let j = i;
            while (j + 1 < bars.length && 
                   new Date(bars[j + 1].t).toISOString().split('T')[0] === barDate) {
                j++;
            }
            previousClose = bars[j].c;
            break;
        }
    }
    
    // If we couldn't find a previous day's close
    if (previousClose === null) {
        return { error: "Previous day's close not found" };
    }
    
    // Compute changes
    const absoluteChange = currentPrice - previousClose;
    const percentChange = (absoluteChange / previousClose) * 100;
    
    // Return results with percentChange rounded to 2 decimal places
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
            
            // To calculate price change, we need historical data
            const params = new URLSearchParams({
                timeframe: "1Day",
                limit: "5", // We just need a few days to calculate change
            })
            
            if (start) params.append("start", start)
            if (end) params.append("end", end)
            
            try {
                const data = await fetchHistoricalBars(symbol, params)
                const priceChange = computePriceChange(data.bars)
                
                return NextResponse.json({ 
                    latestBar,
                    priceChange: priceChange
                })
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
        
        const priceChange = computePriceChange(data.bars)

        return NextResponse.json({ 
            chartData,
            priceChange: priceChange
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error"
        console.error(`Error processing request for ${symbol}:`, error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
