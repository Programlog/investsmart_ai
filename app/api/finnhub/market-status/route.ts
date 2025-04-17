import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
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

        // Only return relevant fields
        return NextResponse.json({
            market: "US",
            status: data.marketState === "REGULAR" ? "open" : "closed",
            session: data.session || "regular",
            holiday: data.holiday || undefined,
        })
    } catch (err) {
        return NextResponse.json({ error: "Unable to load market status" }, { status: 500 })
    }
}
