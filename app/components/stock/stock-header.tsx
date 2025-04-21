"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuoteData {
    symbol: string
    askPrice: number | null
    bidPrice: number | null
    price: number | null
    timestamp: string
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
    const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const isPositiveChange = data.change >= 0

    useEffect(() => {
        if (!data.symbol) return

        const fetchQuote = async () => {
            setError(null)
            try {
                const response = await fetch(`/api/market/stock?symbol=${data.symbol}&type=quote`)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || `Failed to fetch quote (${response.status})`)
                }
                const result = await response.json()
                if (!result.quote || result.quote.price === undefined) {
                    throw new Error("Invalid quote data received")
                }
                setQuoteData(result.quote)
            } catch (err: any) {
                setError(err.message)
                setQuoteData(null)
            } finally {
                if (isLoading) setIsLoading(false)
            }
        }

        fetchQuote()
        const intervalId = setInterval(fetchQuote, 30000) // 30s, matches API cache

        return () => clearInterval(intervalId)
    }, [data.symbol, isLoading])

    const formatTimestamp = (isoTimestamp?: string) => {
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
            {/* Static Info */}
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">
                    {data.exchange} - {data.exchange} Real Time Price • {data.currency}
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
                        ) : quoteData?.price !== null && quoteData?.price !== undefined ? (
                            <span className="text-4xl font-bold">{quoteData.price.toFixed(2)}</span>
                        ) : (
                            <span className="text-4xl font-bold text-muted-foreground">N/A</span>
                        )}
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
                            ? "Loading latest price..."
                            : error
                                ? `Error: ${error}`
                                : `Last updated: ${formatTimestamp(quoteData?.timestamp)}`}
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
