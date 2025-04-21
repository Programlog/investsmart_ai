"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Settings } from "lucide-react"

type ChartPeriod = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "All"

export default function StockChart({ data }: { data: any }) {
    const [activePeriod, setActivePeriod] = useState<ChartPeriod>("1D")
    const [showEvents, setShowEvents] = useState(false)

    const chartData = data.chartData || []
    const lastPrice = chartData[chartData.length - 1]?.price || data.price
    const startPrice = chartData[0]?.price || data.previousClose
    const max = Math.max(...chartData.map((d: any) => d.price)) * 1.001 // Add a little padding
    const min = Math.min(...chartData.map((d: any) => d.price)) * 0.999 // Add a little padding

    // Select visible data points based on the period
    const visibleData = (() => {
        switch (activePeriod) {
            case "1D":
                return chartData
            // In a real implementation, you would have different data sets for different time periods
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
                                tickFormatter={(value) => value.toFixed(2)}
                            />
                            <Tooltip
                                formatter={(value: any) => [`$${value}`, "Price"]}
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
                </div>
            </CardContent>
        </Card>
    )
}
