"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import StockHeader from "@/components/stock/stock-header"
import StockChart from "@/components/stock/stock-chart"
import StockStats from "@/components/stock/stock-stats"
import StockNews from "@/components/stock/stock-news"
import DashboardHeader from "@/components/common/dashboard-header"

export default function StockDetailPage() {
    const params = useParams()
    const symbol = (params.symbol as string).toUpperCase()

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />
            <main className="flex-1 container py-8">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        ← Back to Dashboard
                    </Button>
                </div>

                <div className="space-y-6">
                    <StockHeader symbol={symbol} />
                    <StockChart symbol={symbol} />
                    <StockStats symbol={symbol} />
                    <StockNews symbol={symbol} />
                </div>
            </main>
        </div>
    )
}
