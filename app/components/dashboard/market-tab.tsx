"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { generateMarketCommentary } from "@/services/ai-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SYMBOL_MAP_FINNHUB = {
  sp500: "^GSPC",
  nasdaq: "^IXIC",
  dow: "^DJI",
  russell: "^RUT",
}

const SYMBOL_MAP_ALPHA_VANTAGE = {
  sp500: "SPY",
  nasdaq: "QQQ",
  dow: "DIA",
  russell: "IWM",
}

type MarketIndex = {
  id: string
  name: string
  value: number
  change: number
  changePercent: number
}

type TrendingAsset = {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  sentiment: "positive" | "neutral" | "negative"
}

type NewsItem = {
  id: string
  headline: string
  source: string
  summary: string
  datetime: number
  url: string
}

type MarketStatus = {
  market: string
  status: "open" | "closed"
  session: string
  holiday?: string
}

const formatTime = (unix: number): string => {
  const date = new Date(unix * 1000)
  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getSentimentBadge = (sentiment: string): JSX.Element => {
  switch (sentiment) {
    case "positive":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Bullish</Badge>
    case "negative":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bearish</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Neutral</Badge>
  }
}

const getStatusBadge = (status: string, session: string): JSX.Element => {
  if (status === "open") {
    if (session === "pre") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pre-Market</Badge>
    }
    if (session === "post") {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Post-Market</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 border-green-300">Open</Badge>
  }
  return <Badge className="bg-red-100 text-red-800 border-red-300">Closed</Badge>
}

const formatSession = (session: string): string => {
  switch (session) {
    case "pre":
      return "Pre-Market"
    case "regular":
      return "Regular Session"
    case "post":
      return "Post-Market"
    default:
      return session.charAt(0).toUpperCase() + session.slice(1)
  }
}

export default function MarketTab() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [trendingAssets, setTrendingAssets] = useState<TrendingAsset[]>([])
  const [marketNews, setMarketNews] = useState<NewsItem[]>([])
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [indexQuotes, setIndexQuotes] = useState<Record<string, any>>({})
  const [lineChartData, setLineChartData] = useState<{ date: string; close: number }[]>([])
  const [marketCommentary, setMarketCommentary] = useState<string>("")
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  const [trendingAssetsLoading, setTrendingAssetsLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [marketStatusLoading, setMarketStatusLoading] = useState(true)
  const [indexQuotesLoading, setIndexQuotesLoading] = useState(true)
  const [lineChartLoading, setLineChartLoading] = useState(false)
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false)
  const [trendingAssetsError, setTrendingAssetsError] = useState<string | null>(null)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [marketStatusError, setMarketStatusError] = useState<string | null>(null)
  const [indexQuotesError, setIndexQuotesError] = useState<string | null>(null)
  const [lineChartError, setLineChartError] = useState<string | null>(null)
  const [commentaryError, setCommentaryError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const indices: MarketIndex[] = [
        { id: "sp500", name: "S&P 500", value: 5123.45, change: 23.45, changePercent: 0.46 },
        { id: "dow", name: "Dow Jones", value: 38765.32, change: -125.68, changePercent: -0.32 },
        { id: "nasdaq", name: "NASDAQ", value: 16234.78, change: 78.92, changePercent: 0.49 },
        { id: "russell", name: "Russell 2000", value: 2045.67, change: 12.34, changePercent: 0.61 },
      ]
      setMarketIndices(indices)
      if (!selectedIndex) {
        setSelectedIndex(indices[0].id)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedIndex])

  useEffect(() => {
    const fetchTrendingAssets = async () => {
      setTrendingAssetsLoading(true)
      setTrendingAssetsError(null)
      try {
        const res = await fetch("/api/market/trending")
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
        const data = await res.json()
        const formattedAssets: TrendingAsset[] = data.slice(0, 5).map((item: any, index: number) => ({
          id: item.symbol || `trend-${index}`,
          symbol: item.symbol || "N/A",
          name: item.name || "Unknown Asset",
          price: 0,
          change: 0,
          changePercent: 0,
          volume: String(item.volume ?? "0"),
          sentiment: "neutral",
        }))
        setTrendingAssets(formattedAssets)
      } catch (error) {
        console.error("Error fetching trending assets:", error)
        setTrendingAssetsError("Unable to load trending assets.")
        setTrendingAssets([])
      } finally {
        setTrendingAssetsLoading(false)
      }
    }
    fetchTrendingAssets()
  }, [])

  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true)
      setNewsError(null)
      try {
        const res = await fetch("/api/market/news")
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
        const news = await res.json()
        if (Array.isArray(news)) {
          setMarketNews(news)
        } else {
          throw new Error("Invalid news data format received")
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setNewsError("Unable to load market news.")
        setMarketNews([])
      } finally {
        setNewsLoading(false)
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    const fetchMarketStatus = async () => {
      setMarketStatusLoading(true)
      setMarketStatusError(null)
      try {
        const res = await fetch("/api/market/status")
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
        const data = await res.json()
        setMarketStatus(data)
      } catch (error) {
        console.error("Error fetching market status:", error)
        setMarketStatusError("Unable to load market status.")
        setMarketStatus(null)
      } finally {
        setMarketStatusLoading(false)
      }
    }
    fetchMarketStatus()
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchIndexQuotes = async () => {
      setIndexQuotesLoading(true)
      setIndexQuotesError(null)
      try {
        const res = await fetch("/api/market/index-quote")
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
        const data = await res.json()
        if (isMounted) {
          setIndexQuotes(data)
        }
      } catch (error) {
        console.error("Error fetching index quotes:", error)
        if (isMounted) {
          setIndexQuotesError("Unable to load real-time index quotes.")
          setIndexQuotes({})
        }
      } finally {
        if (isMounted) {
          setIndexQuotesLoading(false)
        }
      }
    }
    fetchIndexQuotes()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedIndex) return

    const fetchChartData = async () => {
      const symbol = SYMBOL_MAP_ALPHA_VANTAGE[selectedIndex as keyof typeof SYMBOL_MAP_ALPHA_VANTAGE] || "SPY"
      setLineChartLoading(true)
      setLineChartError(null)
      try {
        const res = await fetch(`/api/market/daily?symbol=${symbol}`)
        const data = await res.json()
        if (!res.ok || data?.error) throw new Error(data?.error || `API Error: ${res.statusText}`)
        if (Array.isArray(data) && data.every(item => typeof item.date === "string" && typeof item.close === "number")) {
          setLineChartData(data)
        } else {
          throw new Error("Invalid chart data format received")
        }
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setLineChartError((err as Error).message || "Unable to load chart data.")
        setLineChartData([])
      } finally {
        setLineChartLoading(false)
      }
    }
    fetchChartData()
  }, [selectedIndex])

  useEffect(() => {
    if (
      marketIndices.length > 0 &&
      !indexQuotesLoading &&
      !trendingAssetsLoading &&
      !newsLoading &&
      !marketStatusLoading
    ) {
      setIsInitialLoading(false)
    }
  }, [marketIndices.length, indexQuotesLoading, trendingAssetsLoading, newsLoading, marketStatusLoading])

  const updateMarketCommentary = useCallback(async () => {
    if (isInitialLoading || trendingAssetsLoading || !marketIndices.length || !trendingAssets.length) {
      return
    }

    setIsCommentaryLoading(true)
    setCommentaryError(null)
    try {
      const commentaryAssets = trendingAssets.map((asset) => ({
        ...asset,
        price: asset.price ?? 0,
        change: asset.change ?? 0,
        changePercent: asset.changePercent ?? 0,
        volume: asset.volume ?? "N/A",
        sentiment: asset.sentiment ?? "neutral",
      }))

      const commentary = await generateMarketCommentary({
        indices: marketIndices,
        trendingAssets: commentaryAssets,
      })
      setMarketCommentary(commentary)
    } catch (error) {
      console.error("Error generating market commentary:", error)
      setCommentaryError("Failed to generate market commentary.")
      setMarketCommentary("")
    } finally {
      setIsCommentaryLoading(false)
    }
  }, [marketIndices, trendingAssets, isInitialLoading, trendingAssetsLoading])

  useEffect(() => {
    updateMarketCommentary()
  }, [updateMarketCommentary])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setTrendingAssetsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setMarketIndices((prev) =>
      prev.map((index) => ({
        ...index,
        value: index.value * (1 + (Math.random() * 0.01 - 0.005)),
        change: index.change * (1 + (Math.random() * 0.1 - 0.05)),
        changePercent: index.changePercent * (1 + (Math.random() * 0.1 - 0.05)),
      })),
    )

    try {
      const res = await fetch("/api/market/trending")
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`)
      const data = await res.json()
      const formattedAssets: TrendingAsset[] = data.slice(0, 5).map((item: any, index: number) => ({
        id: item.symbol || `trend-${index}`,
        symbol: item.symbol || "N/A",
        name: item.name || "Unknown Asset",
        price: 0,
        change: 0,
        changePercent: 0,
        volume: String(item.volume ?? "0"),
        sentiment: "neutral",
      }))
      setTrendingAssets(formattedAssets)
      setTrendingAssetsError(null)
    } catch (error) {
      console.error("Error refreshing trending assets:", error)
      setTrendingAssetsError("Unable to refresh trending assets.")
    } finally {
      setTrendingAssetsLoading(false)
    }

    setIsRefreshing(false)
  }, [])

  const selectedIndexData = useMemo(
    () => marketIndices.find((index) => index.id === selectedIndex),
    [marketIndices, selectedIndex],
  )

  if (isInitialLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="h-9 w-24 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[110px] bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-muted rounded-lg"></div>
          <div className="h-[400px] bg-muted rounded-lg"></div>
        </div>
        <div className="h-[200px] bg-muted rounded-lg"></div>
        <div className="h-[100px] bg-muted rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            <h2 className="text-2xl font-bold">Market Overview</h2>
            <div className="flex items-center space-x-2">
              {marketStatusLoading ? (
                <Badge className="bg-gray-100 text-gray-800 border-gray-300 animate-pulse">Loading Status...</Badge>
              ) : marketStatusError ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="cursor-help">
                      Status Error
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs px-2 py-1">
                    {marketStatusError}
                  </TooltipContent>
                </Tooltip>
              ) : marketStatus ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label={`Market session: ${formatSession(marketStatus.session)}`}>
                        {getStatusBadge(marketStatus.status, marketStatus.session)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-xs px-3 py-2 rounded-md shadow bg-white border text-gray-700"
                    >
                      Session: <span className="font-medium">{formatSession(marketStatus.session)}</span>
                    </TooltipContent>
                  </Tooltip>
                  {marketStatus.holiday && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-2 text-xs text-orange-600 font-medium cursor-help">Holiday Active</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs px-2 py-1">
                        {marketStatus.holiday}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              ) : (
                <Badge variant="secondary">Status N/A</Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketIndices.map((index) => {
          const symbol = SYMBOL_MAP_FINNHUB[index.id as keyof typeof SYMBOL_MAP_FINNHUB]
          const quote = !indexQuotesLoading && indexQuotes[symbol] ? indexQuotes[symbol] : null
          const price = quote?.price ?? index.value
          const change = quote?.change ?? index.change
          const changePercent = quote?.changePercent ?? index.changePercent
          const isLoadingQuote = indexQuotesLoading

          return (
            <Card
              key={index.id}
              className={`cursor-pointer transition-all ${selectedIndex === index.id ? "border-primary ring-1 ring-primary" : "hover:border-muted-foreground/50"
                }`}
              onClick={() => setSelectedIndex(index.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{index.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingQuote ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-7 w-2/3 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                  </div>
                ) : indexQuotesError && !quote ? (
                  <div className="text-xs text-red-600">Quote N/A</div>
                ) : (
                  <>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">{Number(price).toFixed(2)}</span>
                      <div
                        className={`ml-2 flex items-center text-sm ${changePercent >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {changePercent >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-0.5" />
                        )}
                        <span>{Number(changePercent).toFixed(2)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {change >= 0 ? "+" : ""}
                      {Number(change).toFixed(2)} today
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{selectedIndexData?.name || "Index"} Performance</CardTitle>
            <CardDescription>Last 100 trading days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              {lineChartLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              )}
              {lineChartError ? (
                <div className="flex items-center justify-center h-full text-red-500 text-sm">{lineChartError}</div>
              ) : lineChartData.length === 0 && !lineChartLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No chart data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="date" minTickGap={20} tick={{ fontSize: 12 }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        boxShadow: "var(--shadow-md)",
                      }}
                      formatter={(value) => (typeof value === "number" ? value.toFixed(2) : value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market News</CardTitle>
            <CardDescription>Latest financial headlines</CardDescription>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                    <div className="h-3 w-3/4 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : newsError ? (
              <div className="text-red-500 text-sm py-4 text-center">{newsError}</div>
            ) : marketNews.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">No news available.</div>
            ) : (
              <div
                className="space-y-4 max-h-[420px] overflow-y-auto pr-2 -mr-2 transition-all scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/70"
                style={{ scrollbarGutter: "stable" }}
              >
                {marketNews.slice(0, 10).map((item) => (
                  <div key={item.id} className="border-b pb-3 last:border-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline block mb-1 text-sm leading-snug"
                    >
                      {item.headline}
                    </a>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
                      <span className="truncate pr-2">{item.source}</span>
                      <span className="flex-shrink-0">{formatTime(item.datetime)}</span>
                    </div>
                    {item.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending Assets</CardTitle>
          <CardDescription>Most active stocks based on recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          {trendingAssetsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : trendingAssetsError ? (
            <div className="text-red-500 text-sm py-4 text-center">{trendingAssetsError}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-center w-[100px]">Sentiment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trendingAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No trending assets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trendingAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right">{asset.volume}</TableCell>
                        <TableCell className="text-center">{getSentimentBadge(asset.sentiment)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Commentary</CardTitle>
          <CardDescription>AI-generated analysis of current market conditions</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[80px]">
          {isCommentaryLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : commentaryError ? (
            <div className="text-red-500 text-sm py-4 text-center">{commentaryError}</div>
          ) : marketCommentary ? (
            <p className="text-sm whitespace-pre-line">{marketCommentary}</p>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">No commentary available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

