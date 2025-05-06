"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import type { NewsItem } from "@/types/stock"
import { NewsItemCard } from "@/components/stock/NewsItemCard"

export default function StockNews({ symbol }: { symbol: string }) {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAllNews, setShowAllNews] = useState(false)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`/api/market/stock/news?symbol=${encodeURIComponent(symbol)}`)
                if (!res.ok) throw new Error("Failed to fetch news")
                const data = await res.json()
                if (data.error) throw new Error(data.error)
                setNewsItems(data.news)
            } catch (err) {
                setError("Error fetching news")
                console.error("Error fetching news:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNews()
    }, [symbol])

    const displayedNews = useMemo(() =>
        showAllNews ? newsItems : newsItems.slice(0, 10),
        [newsItems, showAllNews]
    )

    if (error) {
        return (
            <Card>
                <CardContent>
                    <div className="text-red-500 text-sm py-4" role="alert">{error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent News</CardTitle>
                {newsItems.length > 10 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowAllNews(prev => !prev)}
                    >
                        {showAllNews ? (
                            <>Show Less<ArrowUp className="h-4 w-4" /></>
                        ) : (
                            <>View More<ArrowDown className="h-4 w-4" /></>
                        )}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div
                            className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"
                            aria-label="Loading news"
                        />
                    </div>
                ) : displayedNews.length > 0 ? (
                    <div className="space-y-4">
                        {displayedNews.map(item => (
                            <NewsItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-4 text-muted-foreground">No news available.</p>
                )}
            </CardContent>
        </Card>
    )
}
