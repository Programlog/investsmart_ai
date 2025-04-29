import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY

const AlpacaNewsSchema = z.object({
    news: z.array(
        z.object({
            id: z.number(),
            headline: z.string(),
            source: z.string(),
            summary: z.string(),
            created_at: z.string(),
            url: z.string(),
        })
    ),
    next_page_token: z.string().optional(),
})

interface AlpacaNewsItem {
    id: number;
    headline: string;
    source: string;
    summary: string;
    created_at: string;
    url: string;
}

interface AlpacaBar {
    t: string; // RFC-3339
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
}

// Function to fetch the latest bar data
async function fetchLatestBar(symbol: string) {
    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars/latest?feed=iex`
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
    const type = searchParams.get("type") // Check for the type parameter: 'latestBar', 'news', or default 'bars'
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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch latest bar"
            console.error(`Error fetching latest bar for ${symbol}:`, error)
            return NextResponse.json({ error: message }, { status: 500 })
        }
    }

    // --- Handle 'news' type request ---
    if (type === "news") {
        try {
            const url = `https://data.alpaca.markets/v1beta1/news?symbols=${encodeURIComponent(symbol)}&limit=10`
            const res = await fetch(url, {
                headers: {
                    "APCA-API-KEY-ID": ALPACA_API_KEY || "",
                    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY || "",
                },
                next: { revalidate: 1800 }, // Cache for 30 minutes
            })
            if (!res.ok) {
                const errorBody = await res.text()
                console.error(`Alpaca news API error for ${symbol}: ${res.status} ${res.statusText}`, errorBody)
                return NextResponse.json({ error: "Failed to fetch news from Alpaca" }, { status: res.status })
            }
            const data = await res.json()
            const parsed = AlpacaNewsSchema.safeParse(data)
            if (!parsed.success) {
                return NextResponse.json({ error: "Invalid Alpaca news response" }, { status: 500 })
            }
            const news = parsed.data.news.map((item: AlpacaNewsItem) => ({
                id: item.id,
                title: item.headline,
                source: item.source,
                summary: item.summary,
                timestamp: item.created_at,
                url: item.url,
            }))
            return NextResponse.json({ news })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch news"
            console.error(`Error fetching news for ${symbol}:`, error)
            return NextResponse.json({ error: message }, { status: 500 })
        }
    }

    // Fetch 'bars' (default if type is not 'latestBar' or 'news')
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
            next: { revalidate: 15 },
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error(`Alpaca bars API error for ${symbol}: ${res.status} ${res.statusText}`, err) // Debug log
            return NextResponse.json({ error: err.message || "Failed to fetch bar data from Alpaca" }, { status: res.status })
        }

        const data = await res.json()
        const chartData = (data.bars || []).map((bar: AlpacaBar) => ({
            time: bar.t, // ISO8601
            price: bar.c,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            volume: bar.v,
        }))

        return NextResponse.json({ chartData })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error fetching bars"
        console.error(`Error fetching bars for ${symbol}:`, error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
