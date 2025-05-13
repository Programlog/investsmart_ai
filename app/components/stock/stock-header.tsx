"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/actions/watchlist"
import { Skeleton } from "@/components/ui/skeleton"
import type { LatestBarData, CompanyProfile, NewsItem, StockMetrics, StockRating, PriceChange } from "@/types/stock"

const formatTimestamp = (isoTimestamp?: string | null) => {
    if (!isoTimestamp) return "N/A"
    return new Date(isoTimestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
    })
}

// Format large numbers with commas
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(num);
}

// Format percent change with sign and percentage symbol
const formatPercentChange = (percent: number): string => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
}

const getDateDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

// Skeleton component for the stock header
const StockHeaderSkeleton = () => (
    <div className="space-y-4">
        <div className="flex flex-col space-y-1">
            <Skeleton className="h-4 w-48" />
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-9 w-64" />
                </div>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <div className="flex items-baseline">
                    <Skeleton className="h-10 w-32" />
                    <div className="ml-3 flex items-center">
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
                <Skeleton className="h-4 w-40 mt-1" />
            </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-5 w-24" />
        </div>
    </div>
)

export default function StockHeader({ symbol }: { symbol: string }) {
    const [latestBarData, setLatestBarData] = useState<LatestBarData | null>(null)
    const [priceChange, setPriceChange] = useState<PriceChange | null>(null)
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [news, setNews] = useState<NewsItem[]>([])
    const [metrics, setMetrics] = useState<StockMetrics | null>(null)
    const [rating, setRating] = useState<StockRating | null>(null)
    const [isLoadingRating, setIsLoadingRating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isTogglingFollow, setIsTogglingFollow] = useState(false)
    const [loading, setLoading] = useState(true)
    const isPositiveChange = priceChange ? priceChange.absoluteChange >= 0 : false

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [profileRes, barRes, newsRes, metricsRes] = await Promise.all([
                    fetch(`/api/market/stock/header?symbol=${symbol}`),
                    fetch(`/api/market/stock?symbol=${symbol}&type=latestBar&start=${getDateDaysAgo(4)}`),
                    fetch(`/api/market/stock/news?symbol=${symbol}`),
                    fetch(`/api/market/stock/stats?symbol=${encodeURIComponent(symbol)}`)
                ])

                const profileData = await profileRes.json()
                const barData = await barRes.json()
                const newsData = await newsRes.json()
                const metricsData = await metricsRes.json()

                if (!profileRes.ok) throw new Error(profileData.error || `Failed to fetch profile (${profileRes.status})`)
                if (!barRes.ok) throw new Error(barData.error || `Failed to fetch data (${barRes.status})`)
                if (!barData.latestBar?.close) throw new Error("Invalid data received")

                setProfile(profileData.profile)
                setLatestBarData(barData.latestBar)
                setPriceChange(barData.priceChange)
                setNews(newsData.news || [])
                setMetrics(metricsData.metrics)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        const intervalId = setInterval(fetchData, 120000) // 2 minutes
        return () => clearInterval(intervalId)
    }, [symbol])

    useEffect(() => {
        const checkWatchlist = async () => {
            try {
                const watchlist = await getWatchlist()
                setIsFollowing(watchlist.some(item => item.symbol === symbol))
            } catch (error) {
                console.error('Error checking watchlist:', error)
            }
        }
        checkWatchlist()
    }, [symbol])

    const handleToggleFollow = async () => {
        setIsTogglingFollow(true)
        try {
            if (isFollowing) {
                await removeFromWatchlist(symbol)
            } else {
                await addToWatchlist(symbol)
            }
            setIsFollowing(!isFollowing)
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : "Failed to toggle follow")
        } finally {
            setIsTogglingFollow(false)
        }
    }

    const handleGetRating = async () => {
        if (!metrics || isLoadingRating) return

        setIsLoadingRating(true)
        try {
            const response = await fetch('/api/ai/stock-rating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, news, metrics }),
            })

            if (!response.ok) {
                throw new Error('Failed to get stock rating')
            }

            const data = await response.json()
            setRating(data)
        } catch (err) {
            console.error('Error getting stock rating:', err)
            setError(err instanceof Error ? err.message : "Failed to get rating")
        } finally {
            setIsLoadingRating(false)
        }
    }

    const ratingColorClass = useMemo(() => {
        if (!rating?.rating) return "text-gray-600";
        const ratingLower = rating.rating.toLowerCase();
        if (ratingLower === "buy") return "text-green-600";
        if (ratingLower === "sell") return "text-red-600";
        return "text-gray-600";
    }, [rating]);

    // Show skeleton while loading
    if (loading) {
        return <StockHeaderSkeleton />
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">
                    {profile ? `${profile.exchange} • ${profile.currency} • ${profile.finnhubIndustry}` : "Loading..."}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3">
                        {profile?.logo && (
                            <Image
                                src={profile.logo}
                                alt={`${profile.name} logo`}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full"
                            />
                        )}
                        <h1 className="text-3xl font-bold">
                            {profile?.name || "Loading..."} ({symbol})
                        </h1>
                    </div>
                    <Button
                        variant={isFollowing ? "default" : "outline"}
                        size="sm"
                        className="h-8 transition-all duration-200"
                        onClick={handleToggleFollow}
                        disabled={isTogglingFollow}
                    >
                        <Star className={`mr-2 h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                        {isTogglingFollow ? 'Updating...' : (isFollowing ? 'Following' : 'Follow')}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        Compare
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">
                            {error ? "Error" : latestBarData?.close ? formatNumber(latestBarData.close) : "N/A"}
                        </span>
                        {!error && priceChange && (
                            <div className={`ml-3 flex items-center ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                                {isPositiveChange ? (
                                    <ArrowUpRight className="h-5 w-5 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-5 w-5 mr-1" />
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {isPositiveChange ? "+" : ""}
                                        {formatNumber(priceChange.absoluteChange)}
                                    </span>
                                    <span className="text-xs">
                                        {formatPercentChange(priceChange.percentChange)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {error
                            ? `Error: ${error}`
                            : `Last updated: ${formatTimestamp(latestBarData?.timestamp)}`}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGetRating}
                            disabled={isLoadingRating || !metrics}
                            className="rounded-md px-3 py-1 text-sm flex items-center gap-2"
                        >
                            <Info className="h-3.5 w-3.5" />
                            {isLoadingRating ? "Analyzing..." : "Time to buy?"}
                        </Button>
                    </HoverCardTrigger>
                    {rating && (
                        <HoverCardContent align="start" className="w-80">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={`text-lg font-semibold ${ratingColorClass}`}>
                                        {rating.rating || "No Rating"}
                                    </div>
                                    <div className="h-4 w-px bg-gray-200" />
                                    <div className="text-sm text-muted-foreground">
                                        AI Recommendation
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {rating.reasoning || "No reasoning provided."}
                                </p>
                            </div>
                        </HoverCardContent>
                    )}
                </HoverCard>
                {profile?.weburl && (
                    <a
                        href={profile.weburl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Visit website →
                    </a>
                )}
            </div>
        </div>
    )
}
