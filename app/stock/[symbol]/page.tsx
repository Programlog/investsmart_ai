"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StockHeader from "@/components/stock/stock-header"
import StockChart from "@/components/stock/stock-chart"
import StockStats from "@/components/stock/stock-stats"
import StockNews from "@/components/stock/stock-news"
import DashboardHeader from "@/components/common/dashboard-header"
import { getStockData } from "@/lib/stock-service"

export default function StockDetailPage() {
    const params = useParams()
    const symbol = params.symbol as string
    const [isLoading, setIsLoading] = useState(true)
    const [stockData, setStockData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStockData() {
            setIsLoading(true)
            try {
                const data = await getStockData(symbol)
                setStockData(data)
                setError(null)
            } catch (err) {
                console.error("Error fetching stock data:", err)
                setError("Failed to load stock data. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        if (symbol) {
            fetchStockData()
        }
    }, [symbol])

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1 container py-8">
                    <div className="flex justify-between items-center mb-6">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            ← Back to Dashboard
                        </Button>
                    </div>
                    <Card>
                        <CardContent className="flex items-center justify-center h-[400px]">
                            <div className="text-center">
                                <h2 className="text-xl font-bold mb-2">Error</h2>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />
            <main className="flex-1 container py-8">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        ← Back to Dashboard
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                        <p className="mt-4 text-muted-foreground">Loading stock data...</p>
                    </div>
                ) : stockData ? (
                    <div className="space-y-6">
                        <StockHeader data={stockData} />
                        <StockChart symbol={symbol} />
                        <StockStats symbol={symbol} />
                        <StockNews symbol={symbol} />
                    </div>
                ) : null}
            </main>
        </div>
    )
}
