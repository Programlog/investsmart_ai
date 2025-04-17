import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

const getMarketStatus = unstable_cache(
    async (apiKey: string) => {
        const res = await fetch(`https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${apiKey}`)
        if (!res.ok) {
            throw new Error("Failed to fetch market status")
        }
        const data = await res.json()
        return {
            market: "US",
            status: data.marketState === "REGULAR" ? "open" : "closed",
            session: data.session || "regular",
            holiday: data.holiday || undefined,
        }
    },
    ["finnhub-market-status"], // cache key
    { revalidate: 60 } // cache for 60 seconds
)

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.FINNHUB_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 })
        }
        const result = await getMarketStatus(apiKey)
        return NextResponse.json(result)
    } catch (err) {
        return NextResponse.json({ error: "Unable to load market status" }, { status: 500 })
    }
}
