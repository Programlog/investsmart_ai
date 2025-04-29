import { NextResponse } from "next/server"

const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY
const ALPACA_BASE_URL = "https://data.alpaca.markets"

// GET /api/market/multi-stock?symbols=TSLA,AAPL,GOOGL
export async function GET(req: Request) {
    if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
        return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const symbolsParam = searchParams.get("symbols")
    if (!symbolsParam) {
        return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 })
    }
    const symbols = symbolsParam.split(",").map(s => s.trim()).filter(Boolean)
    if (symbols.length === 0) {
        return NextResponse.json({ error: "No valid symbols provided" }, { status: 400 })
    }

    try {
        const url = `${ALPACA_BASE_URL}/v2/stocks/bars/latest?symbols=${symbols.map(encodeURIComponent).join(",")}`
        const res = await fetch(url, {
            headers: {
                "APCA-API-KEY-ID": ALPACA_API_KEY,
                "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
            },
            next: { revalidate: 30 }, // 30s cache
        })
        if (!res.ok) {
            const errorBody = await res.text()
            console.error("Alpaca multi-stock API error:", res.status, errorBody)
            return NextResponse.json({ error: "Failed to fetch latest bars from Alpaca" }, { status: res.status })
        }
        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching multi-stock bars:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
