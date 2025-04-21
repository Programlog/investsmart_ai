import { NextRequest, NextResponse } from "next/server"

const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const timeframe = searchParams.get("timeframe") || "5Day"
    const limit = searchParams.get("limit") || "100"
    const start = searchParams.get("start") // ISO8601
    const end = searchParams.get("end") // ISO8601

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 })
    }

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
            cache: "no-store",
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            return NextResponse.json({ error: err.message || "Failed to fetch data from Alpaca" }, { status: res.status })
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
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
