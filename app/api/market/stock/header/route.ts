import { NextRequest, NextResponse } from "next/server"
import { CompanyProfile } from "@/types/stock"

async function getCompanyProfile(symbol: string, apiKey: string) {
    const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
        {
            headers: { "Content-Type": "application/json" },
            next: { revalidate: 36000 } // Cache for 10 hours
        }
    )

    if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CompanyProfile
}

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
        const profile = await getCompanyProfile(symbol, apiKey)
        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Error fetching company profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch company profile" },
            { status: 500 }
        )
    }
}