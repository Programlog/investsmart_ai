import { NextRequest, NextResponse } from "next/server"

const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY

// Function to fetch the latest bar data
async function fetchLatestBar(symbol: string) {
    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars/latest?feed=iex` // Use the latest bar endpoint
    const res = await fetch(url, {
        headers: {
            "APCA-API-KEY-ID": ALPACA_API_KEY || "",
            "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY || "",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds, adjust as needed
    })

    if (!res.ok) {
        const errorBody = await res.text()
        console.error(`Alpaca latest bar API error for ${symbol}: ${res.status} ${res.statusText}`, errorBody)
        throw new Error(`Failed to fetch latest bar from Alpaca: ${res.statusText}`)
    }

    const data = await res.json()

    // The response structure is { bar: { c, h, l, o, t, v, vw, n }, symbol }
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

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const type = searchParams.get("type") // Check for the type parameter: 'latestBar', or default 'bars'
    const timeframe = searchParams.get("timeframe") || "1Day" // e.g. 1Min, 5Min, 15Min, 1Hour, 1Day
    const limit = searchParams.get("limit") || "100"
    const start = searchParams.get("start") // ISO8601, optional
    const end = searchParams.get("end") // ISO8601, optional

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
    }

    // --- Handle 'latestBar' type request ---
    if (type === "latestBar") {
        try {
            const latestBar = await fetchLatestBar(symbol)
            return NextResponse.json({ latestBar }) // Return nested under 'latestBar' key
        } catch (error: any) {
            console.error(`Error fetching latest bar for ${symbol}:`, error)
            return NextResponse.json({ error: error.message || "Failed to fetch latest bar" }, { status: 500 })
        }
    }

    // --- Existing logic for 'bars' (default if type is not 'latestBar') ---
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
