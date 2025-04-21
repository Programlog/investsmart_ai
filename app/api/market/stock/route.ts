import { NextRequest, NextResponse } from "next/server"

const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY

async function fetchLatestQuote(symbol: string) {
    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/quotes/latest?feed=iex`
    const res = await fetch(url, {
        headers: {
            "APCA-API-KEY-ID": ALPACA_API_KEY || "",
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY || "",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!res.ok) {
        const errorBody = await res.text()
        console.error(`Alpaca quote API error for ${symbol}: ${res.status} ${res.statusText}`, errorBody)
        throw new Error(`Failed to fetch latest quote from Alpaca: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.quote) {
        console.error(`Invalid quote response for ${symbol}:`, data)
        throw new Error("Invalid quote response structure from Alpaca")
    }

    const { ap: askPrice, bp: bidPrice, t: timestamp } = data.quote
    return {
        symbol,
        askPrice,
        bidPrice,
        price: askPrice ?? bidPrice,
        timestamp,
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const type = searchParams.get("type") // Check for the type parameter
    const timeframe = searchParams.get("timeframe") || "1Day" // e.g. 1Min, 5Min, 15Min, 1Hour, 1Day
    const limit = searchParams.get("limit") || "100"
    const start = searchParams.get("start") // ISO8601, optional
    const end = searchParams.get("end") // ISO8601, optional

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
    }

    // --- Handle 'quote' type request ---
    if (type === "quote") {
        try {
            const quote = await fetchLatestQuote(symbol)
            return NextResponse.json({ quote })
        } catch (error: any) {
            console.error(`Error fetching latest quote for ${symbol}:`, error) // Log the specific error
            return NextResponse.json({ error: error.message || "Failed to fetch latest quote" }, { status: 500 })
        }
    }

    // --- Existing logic for 'bars' (default) ---
    const params = new URLSearchParams({
        timeframe,
        limit,
    })
    if (start) params.append("start", start)
    if (end) params.append("end", end)

    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars?${params.toString()}&adjustment=all&feed=iex`

    try {
        const res = await fetch(url, {
            headers: {
                "APCA-API-KEY-ID": ALPACA_API_KEY || "",
                "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY || "",
            },
            cache: "no-store", // Keep bars request uncached for now, or add separate caching
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error(`Alpaca bars API error for ${symbol}: ${res.status} ${res.statusText}`, err) // Debug log
            return NextResponse.json({ error: err.message || "Failed to fetch bar data from Alpaca" }, { status: res.status })
        }

        const data = await res.json()
        // Format: { bars: [{ t, o, h, l, c, v }] }
        const chartData = (data.bars || []).map((bar: any) => ({
            time: bar.t, // ISO8601
            price: bar.c,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            volume: bar.v,
        }))

        return NextResponse.json({ chartData })
    } catch (error: any) {
        console.error(`Error fetching bars for ${symbol}:`, error)
        return NextResponse.json({ error: error.message || "Internal server error fetching bars" }, { status: 500 })
    }
}
