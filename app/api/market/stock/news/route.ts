import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

interface FinnhubNewsItem {
    category: string
    datetime: number
    headline: string
    id: number
    image: string
    related: string
    source: string
    summary: string
    url: string
}

const getCompanyNews = unstable_cache(
    async (symbol: string, fromDate: string, toDate: string, apiKey: string) => {
        const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`Failed to fetch news: ${res.statusText}`)
        }

        const data: FinnhubNewsItem[] = await res.json()
        return data.map(item => ({
            id: item.id,
            title: item.headline,
            source: item.source,
            category: item.category,
            timestamp: new Date(item.datetime * 1000).toISOString(),
            summary: item.summary,
            url: item.url,
            image: item.image
        }))
    },
    ["finnhub-company-news"], // cache key prefix
    { revalidate: 300 } // cache for 5 minutes
)

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
    }

    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 })
    }

    const toDate = new Date().toISOString().split('T')[0]
    const fromDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
        const news = await getCompanyNews(symbol, fromDate, toDate, apiKey)
        return NextResponse.json({ news })
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error)
        return NextResponse.json(
            { error: "Unable to load company news at this time." },
            { status: 500 }
        )
    }
}