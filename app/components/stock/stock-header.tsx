"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LatestBarData, StaticStockData } from "@/types/stock"

const formatTimestamp = (isoTimestamp?: string | null) => {
    if (!isoTimestamp) return "N/A"
    return new Date(isoTimestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
    })
}

export default function StockHeader({ data }: { data: StaticStockData }) {
    const [latestBarData, setLatestBarData] = useState<LatestBarData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const isPositiveChange = data.change >= 0

    useEffect(() => {
        if (!data.symbol) return

        const fetchLatestBarData = async () => {
            try {
                const response = await fetch(`/api/market/stock?symbol=${data.symbol}&type=latestBar`)
                const result = await response.json()

                if (!response.ok) throw new Error(result.error || `Failed to fetch data (${response.status})`)
                if (!result.latestBar?.close) throw new Error("Invalid data received")

                setLatestBarData(result.latestBar)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred")
            }
        }

        fetchLatestBarData()
        const intervalId = setInterval(fetchLatestBarData, 60000)
        return () => clearInterval(intervalId)
    }, [data.symbol])

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">
                    {`${data.exchange} • ${data.currency}`}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        {data.name} ({data.symbol})
                    </h1>
                    <Button variant="outline" size="sm" className="h-8">
                        <Star className="mr-2 h-4 w-4" />
                        Following
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
                            {error ? "Error" : latestBarData?.close?.toFixed(2) ?? "N/A"}
                        </span>
                        {!error && (
                            <div className={`ml-3 flex items-center text-lg ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                                {isPositiveChange ? (
                                    <ArrowUpRight className="h-5 w-5 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-5 w-5 mr-1" />
                                )}
                                <span className="font-medium">
                                    {isPositiveChange ? "+" : ""}
                                    {data.change.toFixed(2)}
                                </span>
                                <span className="ml-1 font-medium">
                                    ({isPositiveChange ? "+" : ""}
                                    {data.changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {error
                            ? `Error: ${error}`
                            : `Closing price as of: ${formatTimestamp(latestBarData?.timestamp)}`}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help rounded-md px-3 py-1 text-sm flex items-center">
                                <Info className="h-3.5 w-3.5 mr-1" />
                                Time to buy {data.symbol}?
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Get AI-powered investment advice</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
