"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { generateMarketCommentary } from "@/services/ai-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type MarketIndex = {
  id: string
  name: string
  value: number
  change: number
  changePercent: number
  data: { time: string; value: number }[]
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

export default function MarketTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [trendingAssets, setTrendingAssets] = useState<TrendingAsset[]>([])
  const [marketNews, setMarketNews] = useState<NewsItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
  const [marketCommentary, setMarketCommentary] = useState<string>("")
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(false)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [marketStatusError, setMarketStatusError] = useState<string | null>(null)

  const updateMarketCommentary = async () => {
    setIsCommentaryLoading(true);
    try {
      const commentary = await generateMarketCommentary({
        indices: marketIndices,
        trendingAssets
      });
      setMarketCommentary(commentary);
    } catch (error) {
      console.error("Error generating market commentary:", error);
    } finally {
      setIsCommentaryLoading(false);
    }
  };

  const formatTime = (unix: number) => {
    const date = new Date(unix * 1000)
    return date.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  useEffect(() => {
    // Simulate API call to fetch market data
    setTimeout(() => {
      const indices: MarketIndex[] = [
        {
          id: "sp500",
          name: "S&P 500",
          value: 5123.45,
          change: 23.45,
          changePercent: 0.46,
          data: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: 5100 + Math.random() * 50,
          })),
        },
        {
          id: "dow",
          name: "Dow Jones",
          value: 38765.32,
          change: -125.68,
          changePercent: -0.32,
          data: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: 38800 - Math.random() * 200,
          })),
        },
        {
          id: "nasdaq",
          name: "NASDAQ",
          value: 16234.78,
          change: 78.92,
          changePercent: 0.49,
          data: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: 16200 + Math.random() * 100,
          })),
        },
        {
          id: "russell",
          name: "Russell 2000",
          value: 2045.67,
          change: 12.34,
          changePercent: 0.61,
          data: Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            value: 2030 + Math.random() * 30,
          })),
        },
      ]

      const trending: TrendingAsset[] = [
        {
          id: "1",
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 175.5,
          change: 2.75,
          changePercent: 1.59,
          volume: "45.2M",
          sentiment: "positive",
        },
        {
          id: "2",
          symbol: "TSLA",
          name: "Tesla, Inc.",
          price: 245.75,
          change: 12.5,
          changePercent: 5.36,
          volume: "78.1M",
          sentiment: "positive",
        },
        {
          id: "3",
          symbol: "MSFT",
          name: "Microsoft Corporation",
          price: 410.25,
          change: 5.75,
          changePercent: 1.42,
          volume: "22.5M",
          sentiment: "positive",
        },
        {
          id: "4",
          symbol: "NVDA",
          name: "NVIDIA Corporation",
          price: 950.8,
          change: -15.2,
          changePercent: -1.57,
          volume: "35.7M",
          sentiment: "neutral",
        },
        {
          id: "5",
          symbol: "AMZN",
          name: "Amazon.com, Inc.",
          price: 178.35,
          change: 3.25,
          changePercent: 1.86,
          volume: "30.1M",
          sentiment: "positive",
        },
      ]

      setMarketIndices(indices)
      setTrendingAssets(trending)
      setSelectedIndex(indices[0].id)
      setIsLoading(false)
    }, 1500)
  }, [])

  useEffect(() => {
    const fetchNews = async () => {
      setNewsError(null)
      try {
        const res = await fetch("/api/finnhub/news")
        if (!res.ok) throw new Error("Failed to fetch news")
        const news = await res.json()
        if (Array.isArray(news)) {
          setMarketNews(news)
        } else {
          setNewsError("Unable to load market news at this time.")
          setMarketNews([])
        }
      } catch (err) {
        setNewsError("Unable to load market news at this time.")
        setMarketNews([])
      }
    }
    fetchNews()
  }, [])

  useEffect(() => {
    const fetchMarketStatus = async () => {
      setMarketStatusError(null)
      try {
        const res = await fetch("/api/finnhub/market-status")
        if (!res.ok) throw new Error("Failed to fetch market status")
        const data = await res.json()
        setMarketStatus(data)
      } catch (err) {
        setMarketStatusError("Unable to load market status.")
        setMarketStatus(null)
      }
    }
    fetchMarketStatus()
  }, [])

  useEffect(() => {
    if (!isLoading && marketIndices.length > 0 && trendingAssets.length > 0) {
      updateMarketCommentary();
    }
  }, [marketIndices, trendingAssets, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate API call to refresh data
    setTimeout(async () => {
      // Update with slightly different values
      setMarketIndices((prev) =>
        prev.map((index) => ({
          ...index,
          value: index.value * (1 + (Math.random() * 0.01 - 0.005)),
          change: index.change * (1 + (Math.random() * 0.1 - 0.05)),
          changePercent: index.changePercent * (1 + (Math.random() * 0.1 - 0.05)),
          data: index.data.map((point, i) => ({
            ...point,
            value: point.value * (1 + (Math.random() * 0.01 - 0.005)),
          })),
        })),
      )

      setTrendingAssets((prev) =>
        prev.map((asset) => ({
          ...asset,
          price: asset.price * (1 + (Math.random() * 0.02 - 0.01)),
          change: asset.change * (1 + (Math.random() * 0.1 - 0.05)),
          changePercent: asset.changePercent * (1 + (Math.random() * 0.1 - 0.05)),
        })),
      )

      await updateMarketCommentary();
      setIsRefreshing(false)
    }, 1000)
  }

  const selectedIndexData = marketIndices.find((index) => index.id === selectedIndex)

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Bullish</Badge>
      case "negative":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bearish</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Neutral</Badge>
    }
  }

  const getStatusBadge = (status: string, session: string) => {
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

  // Helper to format session for tooltip
  const formatSession = (session: string) => {
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

  return (
    <div className="space-y-6">
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-4">Market Overview</h2>
            {/* Market Status Badge with Tooltip */}
            <div className="flex items-center space-x-2">
              {marketStatusError ? (
                <Badge className="bg-gray-100 text-gray-800 border-gray-300">Status Unavailable</Badge>
              ) : marketStatus ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} aria-label={`Market session: ${formatSession(marketStatus.session)}`}>
                        {getStatusBadge(marketStatus.status, marketStatus.session)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs px-3 py-2 rounded-md shadow bg-white border text-gray-700">
                      Session: <span className="font-medium">{formatSession(marketStatus.session)}</span>
                    </TooltipContent>
                  </Tooltip>
                  {marketStatus.holiday && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      Holiday: {marketStatus.holiday}
                    </span>
                  )}
                </>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-gray-300 animate-pulse">Loading...</Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
            {isRefreshing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </TooltipProvider>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading market data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketIndices.map((index) => (
              <Card
                key={index.id}
                className={`cursor-pointer transition-all ${selectedIndex === index.id ? "border-primary" : ""}`}
                onClick={() => setSelectedIndex(index.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{index.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">
                      {index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <div
                      className={`ml-2 flex items-center ${index.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {index.changePercent >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      <span>{index.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {index.change >= 0 ? "+" : ""}
                    {index.change.toFixed(2)} today
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedIndexData?.name} Performance</CardTitle>
                <CardDescription>Today's trading activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {selectedIndexData && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedIndexData.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={["auto", "auto"]} />
                        <RechartsTooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
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
                {newsError ? (
                  <div className="text-red-500 text-sm py-4">{newsError}</div>
                ) : (
                  <div
                    className="space-y-4 max-h-[420px] overflow-y-auto pr-2 transition-all scrollbar-thin scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/70"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(107,114,128,0.4) transparent",
                    }}
                  >
                    {marketNews.slice(0, 10).map((item, idx) => (
                      <div
                        key={item.id}
                        className={`border-b pb-3 last:border-0 transition-opacity ${idx > 2 ? "opacity-80" : ""
                          }`}
                        style={{
                          display: idx < 3 ? "block" : "block",
                        }}
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline block mb-1 text-base"
                        >
                          {item.headline}
                        </a>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{item.source}</span>
                          <span>{formatTime(item.datetime)}</span>
                        </div>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.summary}</p>
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
              <CardDescription>Most active stocks with market sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium">Symbol</th>
                        <th className="h-10 px-4 text-left font-medium">Name</th>
                        <th className="h-10 px-4 text-right font-medium">Price</th>
                        <th className="h-10 px-4 text-right font-medium">Change</th>
                        <th className="h-10 px-4 text-right font-medium">Volume</th>
                        <th className="h-10 px-4 text-center font-medium">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendingAssets.map((asset) => (
                        <tr key={asset.id} className="border-b">
                          <td className="p-4 font-medium">{asset.symbol}</td>
                          <td className="p-4">{asset.name}</td>
                          <td className="p-4 text-right">${asset.price.toFixed(2)}</td>
                          <td
                            className={`p-4 text-right ${asset.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            <div className="flex items-center justify-end">
                              {asset.changePercent >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {asset.changePercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="p-4 text-right">{asset.volume}</td>
                          <td className="p-4 text-center">{getSentimentBadge(asset.sentiment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market Commentary</CardTitle>
              <CardDescription>AI-generated analysis of current market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {isCommentaryLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-line">{marketCommentary}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

