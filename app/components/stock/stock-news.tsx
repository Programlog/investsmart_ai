"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"

type NewsCategory = "all" | "news" | "press" | "filing"

type NewsItem = {
    id: string | number
    title: string
    source: string
    timestamp: string
    summary: string
    category: string
    url: string
    image?: string
}

export default function StockNews({ symbol }: { symbol: string }) {
    const [activeCategory, setActiveCategory] = useState<NewsCategory>("all")
    const [newsItems, setNewsItems] = useState<NewsItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    const filteredNews = useMemo(() => {
        const filtered = activeCategory === "all"
            ? newsItems
            : newsItems.filter((item) => item.category === activeCategory)
        return filtered.slice(0, 10)
    }, [newsItems, activeCategory])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent News</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1">
                    View More <ArrowRight className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <Tabs
                    defaultValue="all"
                    value={activeCategory}
                    onValueChange={(value) => setActiveCategory(value as NewsCategory)}
                >
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="news">News</TabsTrigger>
                        <TabsTrigger value="press" disabled>Press Releases</TabsTrigger>
                        <TabsTrigger value="filing" disabled>SEC Filings</TabsTrigger>
                    </TabsList>

                    {error && (
                        <div className="text-red-500 text-sm py-4" role="alert">{error}</div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" aria-label="Loading news" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNews.length > 0 ? (
                                filteredNews.map((item) => (
                                    <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                                        <h3 className="font-medium hover:underline cursor-pointer mb-1">
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <span>{item.source}</span>
                                                <span className="mx-2">•</span>
                                                <Clock className="h-3 w-3 mr-1" />
                                                <span>{item.timestamp}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                                        {/* <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                Read more <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </Button> */}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-4 text-muted-foreground">No news available for this category.</p>
                            )}
                        </div>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    )
}
