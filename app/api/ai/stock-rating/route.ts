import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { generateStockRating } from '@/services/ai-service'
import type { StockMetrics, StockRatingRequest } from '@/types/stock'

// Create a cached version of the stock rating generation function
const getCachedStockRating = unstable_cache(
    async (ratingRequest: StockRatingRequest) => {
        return generateStockRating(ratingRequest)
    },
    ['stock-rating'],
    { revalidate: 86400 } // Cache for 1 day
)

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

        // Use the cached version of generateStockRating
        const rating = await getCachedStockRating(ratingRequest)

        return NextResponse.json(rating)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate stock rating' }, { status: 500 })
    }
}