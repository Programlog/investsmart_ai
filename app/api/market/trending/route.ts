import { NextResponse } from "next/server"

// Environment variables for Alpaca API
const ALPACA_API_KEY = process.env.ALPACA_API_KEY
const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY
const ALPACA_BASE_URL = "https://data.alpaca.markets"

// TypeScript interfaces
interface AlpacaMostActive {
    symbol: string
    volume: number
    trade_count: number
    price: number
    change: number
    change_percent: number
}

interface AlpacaResponse {
    most_actives: AlpacaMostActive[]
}

export async function GET() {
    if (!ALPACA_API_KEY || !ALPACA_SECRET_KEY) {
        return NextResponse.json(
            { error: "API configuration error" },
            { status: 500 }
        )
    }

    try {
        const response = await fetch(
            `${ALPACA_BASE_URL}/v1beta1/screener/stocks/most-actives?by=trades`,
            {
                headers: {
                    "APCA-API-KEY-ID": ALPACA_API_KEY,
                    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
                },
                next: { revalidate: 10800 }, // Cache for 3 hours
            }
        )

        if (!response.ok) {
            const errorBody = await response.text()
            console.error("Alpaca API error:", response.status, errorBody)

            return NextResponse.json(
                { error: "Failed to fetch trending assets" },
                { status: response.status }
            )
        }

        const data: AlpacaResponse = await response.json()

        // Transform and format the response data
        const formattedAssets = data.most_actives.map((asset, index) => ({
            id: `trend-${index}`, // Generate unique ID for each asset
            symbol: asset.symbol,
            name: asset.symbol, // Using symbol as name since Alpaca doesn't provide company names
            price: asset.price,
            change: asset.change,
            changePercent: asset.change_percent,
            volume: formatVolume(asset.volume),
            sentiment: calculateSentiment(asset.change_percent)
        }))

        return NextResponse.json(formattedAssets)

    } catch (error) {
        console.error("Error fetching trending assets:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

function formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
        return `${(volume / 1_000_000).toFixed(1)}M`
    } else if (volume >= 1_000) {
        return `${(volume / 1_000).toFixed(1)}K`
    }
    return volume.toString()
}

// Helper function to determine sentiment based on price change
function calculateSentiment(changePercent: number): "positive" | "neutral" | "negative" {
    if (changePercent > 1) return "positive"
    if (changePercent < -1) return "negative"
    return "neutral"
}
