"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Settings } from "lucide-react"

type ChartPeriod = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All"

interface ChartDatum {
    time: string
    price: number
    open: number
    high: number
    low: number
    volume: number
}

interface StockChartProps {
    data: {
        symbol: string
        price: number
        previousClose: number
    }
}

export default function StockChart({ data }: StockChartProps) {
    const [activePeriod, setActivePeriod] = useState<ChartPeriod>("1D")
    const [showEvents, setShowEvents] = useState(false)
    const [chartData, setChartData] = useState<ChartDatum[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch chart data from API
    useEffect(() => {
        let isMounted = true
        async function fetchChart() {
            setLoading(true)
            setError(null)
            try {
                const now = new Date()
                let startDate = new Date(now)
                let endDate = new Date(now)
                let timeframe = "5Min"
                let limit = 100

                switch (activePeriod) {
                    case "1D": {
                        // Find the most recent weekday (Mon-Fri)
                        const day = now.getDay()
                        let offset = 0
                        if (day === 0) offset = -2 // Sunday -> Friday
                        else if (day === 6) offset = -1 // Saturday -> Friday
                        startDate = new Date(now)
                        startDate.setDate(now.getDate() + offset)
                        startDate.setHours(9, 30, 0, 0)
                        endDate = new Date(now)
                        endDate.setDate(now.getDate() + offset)
                        endDate.setHours(16, 0, 0, 0)
                        timeframe = "5Min"
                        limit = 78
                        break
                    }
                    case "5D":
                        startDate.setDate(now.getDate() - 7)
                        timeframe = "15Min"
                        limit = 130
                        break
                    case "1M":
                        startDate.setMonth(now.getMonth() - 1)
                        timeframe = "1Hour"
                        limit = 160
                        break
                    case "6M":
                        startDate.setMonth(now.getMonth() - 6)
                        timeframe = "1Day"
                        limit = 130
                        break
                    case "YTD":
                        startDate = new Date(now.getFullYear(), 0, 1)
                        timeframe = "1Day"
                        limit = 180
                        break
                    case "1Y":
                        startDate.setFullYear(now.getFullYear() - 1)
                        timeframe = "1Day"
                        limit = 260
                        break
                    case "5Y":
                        startDate.setFullYear(now.getFullYear() - 5)
                        timeframe = "1Week"
                        limit = 260
                        break
                    case "All":
                        startDate.setFullYear(now.getFullYear() - 10)
                        timeframe = "1Month"
                        limit = 120
                        break
                    default:
                        break
                }

                const start = startDate.toISOString()
                const end = endDate.toISOString()
                const url = `/api/market/stock?symbol=${encodeURIComponent(data.symbol)}&timeframe=${timeframe}&limit=${limit}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
                const res = await fetch(url)
                const json = await res.json()
                if (!res.ok || !json.chartData) throw new Error(json.error || "Failed to load chart data")
                if (isMounted) setChartData(json.chartData)
            } catch (err) {
                if (isMounted) setError(err instanceof Error ? err.message : "Error loading chart data")
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchChart()
        return () => { isMounted = false }
    }, [data.symbol, activePeriod])

    const lastPrice = chartData[chartData.length - 1]?.price || data.price
    const startPrice = chartData[0]?.price || data.previousClose
    const max = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) * 1.001 : 0
    const min = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) * 0.999 : 0

    // Select visible data points based on the period
    const visibleData = (() => {
        switch (activePeriod) {
            case "1D":
                return chartData
            default:
                return chartData
        }
    })()

    const isPositiveDay = lastPrice >= startPrice

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <div className="flex space-x-1 overflow-x-auto pb-1">
                        {(["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "All"] as ChartPeriod[]).map((period) => (
                            <Button
                                key={period}
                                variant={activePeriod === period ? "default" : "ghost"}
                                size="sm"
                                className={`rounded-full h-8 px-3 ${activePeriod === period ? "bg-primary text-primary-foreground" : ""}`}
                                onClick={() => setActivePeriod(period)}
                            >
                                {period}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 ${showEvents ? "bg-muted" : ""}`}
                            onClick={() => setShowEvents(!showEvents)}
                        >
                            Key Events
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                            <Settings className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Advanced Chart</span>
                        </Button>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={visibleData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} minTickGap={60} tick={{ fontSize: 12 }} />
                                <YAxis
                                    domain={[min, max]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    orientation="right"
                                    tickCount={5}
                                    tickFormatter={(value: number) => value.toFixed(2)}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value}`, "Price"]}
                                    labelFormatter={() => ""}
                                    contentStyle={{
                                        borderRadius: "6px",
                                        padding: "8px 12px",
                                        border: "1px solid var(--border)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    }}
                                />
                                <ReferenceLine y={data.previousClose} stroke="red" strokeDasharray="3 3" />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositiveDay ? "#10b981" : "#ef4444"}
                                    dot={false}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
