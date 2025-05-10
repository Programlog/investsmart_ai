"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { NewsItem } from "@/types/stock"
import { NewsItemCard } from "@/components/stock/NewsItemCard"

// Skeleton component for news items
const NewsItemSkeleton = () => (
    <div className="border-b pb-4 last:border-0 last:pb-0">
        <div className="flex gap-4">
            <Skeleton className="flex-shrink-0 w-20 h-20 rounded-md" />
            <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-full max-w-md" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    </div>
)

// Skeleton for the entire news section
const NewsSkeletonLoader = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent News</CardTitle>
            <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <NewsItemSkeleton key={i} />
                ))}
            </div>
        </CardContent>
    </Card>
)

export default function StockNews({ symbol }: { symbol: string }) {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAllNews, setShowAllNews] = useState(false)

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setIsLoading(true)
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

    if (isLoading) {
        return <NewsSkeletonLoader />
    }

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
                {displayedNews.length > 0 ? (
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
