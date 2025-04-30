import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

type FinnhubNewsItem = {
    id?: number;
    headline: string;
    source: string;
    summary: string;
    datetime: number;
    url: string;
};

const getNews = unstable_cache(
    async (apiKey: string) => {
        const res = await fetch(
            `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
        )
        if (!res.ok) {
            throw new Error("Failed to fetch news")
        }
        const data: FinnhubNewsItem[] = await res.json()
        return data
            .slice(0, 10)
            .map((item) => ({
                id: item.id,
                headline: item.headline,
                source: item.source,
                summary: item.summary,
                datetime: item.datetime,
                url: item.url,
            }))
    },
    ["finnhub-market-news"], // cache key
    { revalidate: 300 } // cache for 5 minutes
)

export async function GET() {
    const apiKey = process.env.FINNHUB_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "Finnhub API key not set" }, { status: 500 })
    }
    try {
        const news = await getNews(apiKey)
        return NextResponse.json(news)
    } catch {
        return NextResponse.json({ error: "Unable to load market news at this time." }, { status: 500 })
    }
}
