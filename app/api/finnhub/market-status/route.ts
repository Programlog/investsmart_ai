import { NextRequest, NextResponse } from "next/server"

const cache: {
    data: any | null
    timestamp: number
} = {
    data: null,
    timestamp: 0,
}

const CACHE_TTL = 60 * 1000 // 60 seconds

export async function GET(req: NextRequest) {
    const now = Date.now()
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data)
    }
    try {
        const apiKey = process.env.FINNHUB_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 })
        }

        const res = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${apiKey}`)
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch market status" }, { status: 502 })
        }
        const data = await res.json()

        const result = {
            market: "US",
            status: data.marketState === "REGULAR" ? "open" : "closed",
            session: data.session || "regular",
            holiday: data.holiday || undefined,
        }
        // Update cache
        cache.data = result
        cache.timestamp = now

        return NextResponse.json(result)
    } catch (err) {
        return NextResponse.json({ error: "Unable to load market status" }, { status: 500 })
    }
}
