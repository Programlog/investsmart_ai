"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Settings } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChartDatum, StockChartProps, ChartPeriod } from "@/types/stock"
import { previousClose } from "@/lib/utils"

const getDateRange = (modifier: (date: Date) => void): { start: Date; end: Date } => {
    const start = new Date()
    modifier(start)
    return { start, end: new Date() }
}

const getMarketHours = (date: Date) => {
    const day = date.getDay()
    const offset = day === 0 ? -2 : day === 6 ? -1 : 0
    const adjustedDate = new Date(date)
    adjustedDate.setDate(date.getDate() + offset)
    return {
        start: new Date(adjustedDate.setHours(9, 30, 0, 0)),
        end: new Date(adjustedDate.setHours(16, 0, 0, 0))
    }
}

// Format timestamp based on the active time period
const formatTimestamp = (timestamp: string, period: ChartPeriod): string => {
    const date = new Date(timestamp)
    
    switch(period) {
        case "1D":
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        case "5D":
            return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], { hour: '2-digit' })}`;
        case "1M":
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case "6M":
        case "YTD":
        case "1Y":
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        case "5Y":
            return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        case "All":
            return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
        default:
            return date.toLocaleDateString();
    }
}

const CHART_PERIODS: { [key in ChartPeriod]: { timeframe: string; limit: number; getDates: (now: Date) => { start: Date; end: Date } } } = {
    "1D": { timeframe: "5Min", limit: 78, getDates: getMarketHours },
    "5D": { timeframe: "15Min", limit: 130, getDates: (now) => getDateRange(d => d.setDate(d.getDate() - 7)) },
    "1M": { timeframe: "1Hour", limit: 160, getDates: (now) => getDateRange(d => d.setMonth(d.getMonth() - 1)) },
    "6M": { timeframe: "1Day", limit: 130, getDates: (now) => getDateRange(d => d.setMonth(d.getMonth() - 6)) },
    "YTD": { timeframe: "1Day", limit: 180, getDates: () => ({ start: new Date(new Date().getFullYear(), 0, 1), end: new Date() }) },
    "1Y": { timeframe: "1Day", limit: 260, getDates: (now) => getDateRange(d => d.setFullYear(d.getFullYear() - 1)) },
    "5Y": { timeframe: "1Week", limit: 260, getDates: (now) => getDateRange(d => d.setFullYear(d.getFullYear() - 5)) },
    "All": { timeframe: "1Month", limit: 120, getDates: (now) => getDateRange(d => d.setFullYear(d.getFullYear() - 10)) }
} as const

// Skeleton component for the chart
const ChartSkeleton = () => (
    <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="flex space-x-1 overflow-x-auto pb-1">
                {["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "All"].map((period) => (
                    <Skeleton key={period} className="h-8 w-12 rounded-full" />
                ))}
            </div>
            <Skeleton className="h-8 w-32" />
        </div>

        <div className="h-[350px] w-full">
            <div className="h-full w-full bg-muted/20 rounded-md flex flex-col items-center justify-center">
                <div className="space-y-2 w-full px-6">
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-1 w-3/4 mx-auto" />
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-1 w-5/6 mx-auto" />
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-1 w-4/5 mx-auto" />
                    <Skeleton className="h-1 w-full" />
                </div>
            </div>
        </div>
    </div>
)

export default function StockChart({ symbol }: StockChartProps) {
    const [activePeriod, setActivePeriod] = useState<ChartPeriod>("1D")
    const [chartData, setChartData] = useState<ChartDatum[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function fetchChart() {
            setLoading(true)
            setError(null)

            try {
                const now = new Date()
                const period = CHART_PERIODS[activePeriod]
                const { start, end } = period.getDates(now)

                const url = `/api/market/stock?symbol=${encodeURIComponent(symbol)}&timeframe=${period.timeframe}&limit=${period.limit}&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`
                const res = await fetch(url, { signal: controller.signal })
                const json = await res.json()

                if (!res.ok || !json.chartData) throw new Error(json.error || "Failed to load chart data")
                setChartData(json.chartData)
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    setError(err.message)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchChart()
        return () => controller.abort()
    }, [symbol, activePeriod])

    const chartMetrics = useMemo(() => {
        const lastPrice = chartData[chartData.length - 1]?.price || 0
        const startPrice = chartData[0]?.price || 0
        const max = Math.max(...chartData.map((d) => d.price), lastPrice) * 1.001
        const min = Math.min(...chartData.map((d) => d.price), lastPrice) * 0.999
        const prevClose = previousClose(chartData)
        const isPositiveDay = lastPrice >= (activePeriod === "1D" ? prevClose : startPrice)
        const referencePrice = activePeriod === "1D" ? prevClose : startPrice

        return { lastPrice, startPrice, max, min, prevClose, isPositiveDay, referencePrice }
    }, [chartData, activePeriod])

    // Calculate appropriate tick intervals based on the active period
    const xAxisTickInterval = useMemo(() => {
        switch(activePeriod) {
            case "1D": return 10; // Every ~50 minutes for a trading day
            case "5D": return 8;  // Every ~10 hours for 5 days
            case "1M": return 6;  // Every ~5 days for a month
            case "6M": 
            case "YTD": 
            case "1Y": return 8;  // Every ~1.5 months for a year
            case "5Y": return 10; // Every ~6 months for 5 years
            case "All": return 12; // Every ~10 months for 10 years
            default: return 5;
        }
    }, [activePeriod]);

    // Format tooltip timestamp
    const formatTooltipTime = (timestamp: string) => {
        const date = new Date(timestamp);
        
        if (activePeriod === "1D") {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (["5D", "1M"].includes(activePeriod)) {
            return date.toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                {loading ? (
                    <ChartSkeleton />
                ) : error ? (
                    <div className="flex items-center justify-center h-[350px] text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="flex flex-wrap justify-between items-center mb-6">
                            <div className="flex space-x-1 overflow-x-auto pb-1">
                                {Object.keys(CHART_PERIODS).map((period) => (
                                    <Button
                                        key={period}
                                        variant={activePeriod === period ? "default" : "ghost"}
                                        size="sm"
                                        className={`rounded-full h-8 px-3 ${activePeriod === period ? "bg-primary text-primary-foreground" : ""}`}
                                        onClick={() => setActivePeriod(period as ChartPeriod)}
                                    >
                                        {period}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="h-8">
                                <Settings className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Advanced Chart</span>
                            </Button>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="time" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        minTickGap={60}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(timestamp) => formatTimestamp(timestamp, activePeriod)}
                                        interval={xAxisTickInterval}
                                        padding={{ left: 10, right: 10 }}
                                        allowDataOverflow={true}
                                    />
                                    <YAxis
                                        domain={[chartMetrics.min, chartMetrics.max]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        orientation="right"
                                        tickCount={5}
                                        tickFormatter={(value: number) => value.toFixed(2)}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`$${value}`, "Price"]}
                                        labelFormatter={(timestamp) => formatTooltipTime(timestamp)}
                                        contentStyle={{
                                            borderRadius: "6px",
                                            padding: "8px 12px",
                                            border: "1px solid var(--border)",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                    <ReferenceLine y={chartMetrics.referencePrice} stroke="#6b7280" strokeDasharray="3 3" />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke={chartMetrics.isPositiveDay ? "#10b981" : "#ef4444"}
                                        dot={false}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
