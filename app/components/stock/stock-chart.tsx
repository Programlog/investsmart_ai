"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Settings } from "lucide-react"
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

    return (
        <Card>
            <CardContent className="pt-6">
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
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} minTickGap={60} tick={{ fontSize: 12 }} />
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
                                    labelFormatter={() => ""}
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
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
