import { NextRequest, NextResponse } from 'next/server'
import { generateStockRating } from '@/services/ai-service'
import type { StockMetrics, StockRatingRequest } from '@/types/stock'

/**
 * POST handler for stock rating generation
 * Takes stock symbol, metrics, and optional news articles
 * Returns an AI-generated rating (Buy, Hold, Sell) with reasoning
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Handle optional news array
        const news = Array.isArray(body.news) ? body.news : []

        const ratingRequest: StockRatingRequest = {
            symbol: body.symbol,
            news: news,
            metrics: body.metrics as StockMetrics
        }

        const rating = await generateStockRating(ratingRequest)

        return NextResponse.json(rating)
    } catch (error) {
        console.error('Error generating stock rating:', error)

        return NextResponse.json(
            { error: 'Failed to generate stock rating' },
            { status: 500 }
        )
    }
}