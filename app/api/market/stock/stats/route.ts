import { NextRequest, NextResponse } from "next/server"
import type { StockMetrics } from "@/types/stock"

export async function GET(req: NextRequest) {
    const symbol = new URL(req.url).searchParams.get("symbol")
    const apiKey = process.env.FINNHUB_API_KEY

    if (!apiKey) {
        return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 })
    }

    if (!symbol) {
        return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    try {
        const response = await fetch(
            `https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`,
            {
                headers: { "Content-Type": "application/json" },
                next: { revalidate: 3600 }
            }
        )

        if (!response.ok) {
            throw new Error(`Finnhub API error: ${response.statusText}`)
        }

        const { metric } = await response.json()
        const metrics = metric as StockMetrics

        return NextResponse.json({ metrics })
    } catch (error) {
        console.error("Error fetching stock metrics:", error)
        return NextResponse.json(
            { error: "Failed to fetch stock metrics" },
            { status: 500 }
        )
    }
}