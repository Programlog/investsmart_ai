"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { getCachedMarketCommentary } from "@/services/ai-service"
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

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function MarketTab() {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false)
  const [commentaryError, setCommentaryError] = useState<string | null>(null)
  const [marketCommentary, setMarketCommentary] = useState<string>("")
  const [showAllTrending, setShowAllTrending] = useState(false)

  // Persist selectedIndex in localStorage for state retention
  useEffect(() => {
    const stored = localStorage.getItem("market_selected_index")
    if (stored) setSelectedIndex(stored)
  }, [])
  useEffect(() => {
    if (selectedIndex) localStorage.setItem("market_selected_index", selectedIndex)
  }, [selectedIndex])

  // Use SWR for all API data fetching and caching
  const { data: trendingAssets, isLoading: trendingAssetsLoading, error: trendingAssetsError } = useSWR(
    "/api/market/trending",
    fetcher,
    { revalidateOnFocus: false }
  )
  // Fetch latest prices for trending assets
  const trendingSymbols = trendingAssets?.map((a: TrendingAsset) => a.symbol).join(",")
  const { data: trendingBars, isLoading: trendingBarsLoading, error: trendingBarsError } = useSWR(
    trendingSymbols ? `/api/market/multi-stock?symbols=${trendingSymbols}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: marketNews, isLoading: newsLoading, error: newsError } = useSWR(
    "/api/market/news",
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: marketStatus, isLoading: marketStatusLoading, error: marketStatusError } = useSWR(
    "/api/market/status",
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: indexQuotes, isLoading: indexQuotesLoading, error: indexQuotesError } = useSWR(
    "/api/market/index-quote",
    fetcher,
    { revalidateOnFocus: false }
  )
  // Chart data depends on selectedIndex
  const chartSymbol = selectedIndex ? SYMBOL_MAP_ALPHA_VANTAGE[selectedIndex as keyof typeof SYMBOL_MAP_ALPHA_VANTAGE] || "SPY" : "SPY"
  const { data: lineChartData, isLoading: lineChartLoading, error: lineChartError } = useSWR(
    selectedIndex ? `/api/market/daily?symbol=${chartSymbol}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Market indices are static for now, but could be fetched with SWR if needed
  useEffect(() => {
    const indices: MarketIndex[] = [
      { id: "sp500", name: "S&P 500", value: 5123.45, change: 23.45, changePercent: 0.46 },
      { id: "dow", name: "Dow Jones", value: 38765.32, change: -125.68, changePercent: -0.32 },
      { id: "nasdaq", name: "NASDAQ", value: 16234.78, change: 78.92, changePercent: 0.49 },
      { id: "russell", name: "Russell 2000", value: 2045.67, change: 12.34, changePercent: 0.61 },
    ]
    setMarketIndices(indices)
    if (!selectedIndex) setSelectedIndex(indices[0].id)
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
    if (isInitialLoading || trendingAssetsLoading || !marketIndices.length || !trendingAssets?.length) {
      return
    }

    setIsCommentaryLoading(true)
    setCommentaryError(null)
    try {
      const commentaryAssets = trendingAssets.map((asset: TrendingAsset) => ({
        ...asset,
        price: asset.price ?? 0,
        change: asset.change ?? 0,
        changePercent: asset.changePercent ?? 0,
        volume: asset.volume ?? "N/A",
        sentiment: asset.sentiment ?? "neutral",
      }))

      const commentary = await getCachedMarketCommentary({
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

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setMarketIndices((prev) =>
      prev.map((index) => ({
        ...index,
        value: index.value * (1 + (Math.random() * 0.01 - 0.005)),
        change: index.change * (1 + (Math.random() * 0.1 - 0.05)),
        changePercent: index.changePercent * (1 + (Math.random() * 0.1 - 0.05)),
      })),
    )

    setIsRefreshing(false)
  }, [])

  const displayedTrendingAssets = useMemo(() => {
    if (!trendingAssets) return []
    return showAllTrending ? trendingAssets : trendingAssets.slice(0, 5)
  }, [trendingAssets, showAllTrending])

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
          const quote = !indexQuotesLoading && indexQuotes?.[symbol] ? indexQuotes[symbol] : null
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
              ) : lineChartData?.length === 0 && !lineChartLoading ? (
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
            ) : marketNews?.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">No news available.</div>
            ) : (
              <div
                className="space-y-4 max-h-[420px] overflow-y-auto pr-2 transition-all scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/70"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(107,114,128,0.4) transparent",
                }}
              >
                {marketNews.slice(0, 10).map((item: NewsItem) => (
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
          {trendingAssetsLoading || trendingBarsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : trendingAssetsError || trendingBarsError ? (
            <div className="text-red-500 text-sm py-4 text-center">{trendingAssetsError || trendingBarsError}</div>
          ) : (
            <div className="rounded-md border transition-all duration-300">
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
                  {displayedTrendingAssets?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No trending assets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTrendingAssets.map((asset: TrendingAsset) => {
                      const bar = trendingBars?.bars?.[asset.symbol]
                      return (
                        <TableRow key={asset.id} className="transition-all duration-300">
                          <TableCell className="font-medium">
                            <Link href={`/stock/${asset.symbol}`} className="hover:underline text-primary">
                              {asset.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">{bar ? bar.c.toFixed(2) : "-"}</TableCell>
                          <TableCell className="text-right">{bar ? (bar.c - bar.o >= 0 ? "+" : "") + (bar.c - bar.o).toFixed(2) : "-"}</TableCell>
                          <TableCell className="text-right">{asset.volume}</TableCell>
                          <TableCell className="text-center">{getSentimentBadge(asset.sentiment)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
              {trendingAssets && trendingAssets.length > 5 && (
                <div className="flex justify-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="transition-all duration-200"
                    onClick={() => setShowAllTrending((v) => !v)}
                  >
                    {showAllTrending ? "Show Less" : "Show More"}
                  </Button>
                </div>
              )}
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

