"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { generateMarketCommentary } from "@/services/ai-service"

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
  title: string
  source: string
  time: string
  url: string
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

      const news: NewsItem[] = [
        {
          id: "1",
          title: "Fed signals potential rate cuts later this year as inflation cools",
          source: "Bloomberg",
          time: "2 hours ago",
          url: "#",
        },
        {
          id: "2",
          title: "Tech stocks rally on strong earnings reports from major players",
          source: "CNBC",
          time: "4 hours ago",
          url: "#",
        },
        {
          id: "3",
          title: "Oil prices drop amid concerns over global demand outlook",
          source: "Reuters",
          time: "6 hours ago",
          url: "#",
        },
        {
          id: "4",
          title: "Retail sales data shows consumer spending remains resilient",
          source: "Wall Street Journal",
          time: "8 hours ago",
          url: "#",
        },
        {
          id: "5",
          title: "Housing market shows signs of cooling as mortgage rates climb",
          source: "Financial Times",
          time: "10 hours ago",
          url: "#",
        },
      ]

      setMarketIndices(indices)
      setTrendingAssets(trending)
      setMarketNews(news)
      setSelectedIndex(indices[0].id)
      setIsLoading(false)
    }, 1500)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Market Overview</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
          {isRefreshing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

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
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
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
                <div className="space-y-4">
                  {marketNews.map((item) => (
                    <div key={item.id} className="border-b pb-3 last:border-0">
                      <a href={item.url} className="font-medium hover:underline block mb-1">
                        {item.title}
                      </a>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
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

