"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LatestBarData {
    symbol: string
    close: number | null
    timestamp: string | null
}

interface StaticStockData {
    symbol: string
    name: string
    exchange: string
    currency: string
    change: number
    changePercent: number
}

export default function StockHeader({ data }: { data: StaticStockData }) {
    const [latestBarData, setLatestBarData] = useState<LatestBarData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const isPositiveChange = data.change >= 0

    useEffect(() => {
        if (!data.symbol) return

        const fetchLatestBarData = async () => {
            setError(null)
            try {
                // Add type=latestBar to the API request URL
                const response = await fetch(`/api/market/stock?symbol=${data.symbol}&type=latestBar`)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || `Failed to fetch latest bar data (${response.status})`)
                }
                const result = await response.json()
                // Expect data under the 'latestBar' key
                if (!result.latestBar || result.latestBar.close === undefined || result.latestBar.timestamp === undefined) {
                    throw new Error("Invalid latest bar data received")
                }
                setLatestBarData(result.latestBar)
            } catch (err) {
                const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred";
                setError(errorMessage);
                setLatestBarData(null);
            } finally {
                if (isLoading) setIsLoading(false)
            }
        }

        fetchLatestBarData()
        const intervalId = setInterval(fetchLatestBarData, 60000) // Refresh every 60 seconds

        return () => clearInterval(intervalId)
        // Keep isLoading in dependency array for initial load logic
    }, [data.symbol, isLoading])

    // Update formatTimestamp to accept null
    const formatTimestamp = (isoTimestamp?: string | null) => {
        if (!isoTimestamp) return "N/A"
        try {
            return new Date(isoTimestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZoneName: "short",
            })
        } catch {
            return "Invalid Date"
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                {/* Remove tape display, use static data */}
                <div className="text-sm text-muted-foreground">
                    {`${data.exchange} • ${data.currency}`}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        {data.name} ({data.symbol})
                    </h1>
                    <Button variant="outline" size="sm" className="h-8 flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Following
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex items-center">
                        Compare
                    </Button>
                </div>
            </div>

            {/* Dynamic Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-baseline">
                        {isLoading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        ) : error ? (
                            <span className="text-4xl font-bold text-red-600">Error</span>
                        ) : // Use latestBarData.close for price display
                            latestBarData?.close !== null && latestBarData?.close !== undefined ? (
                                <span className="text-4xl font-bold">{latestBarData.close.toFixed(2)}</span>
                            ) : (
                                <span className="text-4xl font-bold text-muted-foreground">N/A</span>
                            )}
                        {/* Keep the change display as it comes from static data */}
                        {!isLoading && !error && (
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
                        {isLoading
                            ? "Loading latest closing price..." // Update loading text
                            : error
                                ? `Error: ${error}`
                                // Use latestBarData.timestamp for update time
                                : `Closing price as of: ${formatTimestamp(latestBarData?.timestamp)}`}
                    </p>
                </div>
            </div>

            {/* Tooltip */}
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
