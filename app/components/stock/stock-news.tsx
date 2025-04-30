"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowDown, ArrowUp, ArrowUpRight } from "lucide-react"
import Image from "next/image"

type NewsItem = {
    id: string | number
    title: string
    source: string
    timestamp: string
    summary: string
    category: string
    url: string
    image: string
}

export default function StockNews({ symbol }: { symbol: string }) {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAllNews, setShowAllNews] = useState(false)

    useEffect(() => {
        async function fetchNews() {
            setIsLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/market/stock/news?symbol=${encodeURIComponent(symbol)}`)
                if (!res.ok) throw new Error("Failed to fetch news")
                const data = await res.json()
                if (data.error) throw new Error(data.error)
                setNewsItems(data.news)
            } catch (error) {
                setError("Error fetching news")
                console.error("Error fetching news:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchNews()
    }, [symbol])

    const displayedNews = showAllNews ? newsItems : newsItems.slice(0, 10)

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent News</CardTitle>
                {newsItems.length > 10 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowAllNews(!showAllNews)}
                    >
                        {showAllNews ? (
                            <>
                                Show Less
                                <ArrowUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                View More
                                <ArrowDown className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="text-red-500 text-sm py-4" role="alert">{error}</div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" aria-label="Loading news" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedNews.length > 0 ? (
                            displayedNews.map((item) => (
                                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex gap-4">
                                        <div className="relative flex-shrink-0 w-20 h-20">
                                            <Image
                                                src={item.image || "/placeholder.jpg"}
                                                alt={item.title}
                                                fill
                                                className="object-cover rounded-md"
                                                sizes="80px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium hover:underline cursor-pointer mb-1">
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                    {item.title}
                                                    <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                                                </a>
                                            </h3>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.source}</span>
                                                    <span className="mx-2">•</span>
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    <span>{item.timestamp}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-muted-foreground">No news available.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
