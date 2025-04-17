import { NextResponse } from "next/server"

const cache: {
    data: any[] | null
    timestamp: number
} = {
    data: null,
    timestamp: 0,
}

const CACHE_TTL = 60 * 1000 * 5 // 5 minutes

export async function GET() {
    const now = Date.now()
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data)
    }

    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "Finnhub API key not set" }, { status: 500 })
    }
    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
        )
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
        }
        const data = await res.json()
        const news = (data as any[])
            .slice(0, 10)
            .map((item) => ({
                id: String(item.id ?? item.datetime),
                headline: item.headline,
                source: item.source,
                summary: item.summary,
                datetime: item.datetime,
                url: item.url,
            }))
        cache.data = news
        cache.timestamp = now
        return NextResponse.json(news)
    } catch (err) {
        return NextResponse.json({ error: "Unable to load market news at this time." }, { status: 500 })
    }
}
