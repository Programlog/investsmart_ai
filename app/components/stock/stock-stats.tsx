'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { StockMetrics, StockStatsProps } from "@/types/stock"

const StatItem = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
    <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
        <p className={`text-base ${className}`}>{value}</p>
    </div>
)

const format = {
    number: (num: number) => num.toFixed(2),
    price: (num: number) => `$${num.toFixed(2)}`,
    marketCap: (num: number) => {
        const value = num * 1000
        return value >= 1e12 ? `${(value / 1e12).toFixed(2)}T` :
            value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` :
                value >= 1e6 ? `${(value / 1e6).toFixed(2)}M` :
                    value.toFixed(2)
    },
    volume: (num: number) => `${num.toFixed(1)}M`,
    percent: (num: number) => `${num.toFixed(2)}%`
}

export default function StockStats({ symbol }: StockStatsProps) {
    const [metrics, setMetrics] = useState<StockMetrics>()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`/api/market/stock/stats?symbol=${encodeURIComponent(symbol)}`)
                if (!response.ok) throw new Error('Failed to fetch stock metrics')
                const data = await response.json()
                setMetrics(data.metrics)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                console.error('Error fetching stock metrics:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [symbol])

    const CardWrapper = ({ children }: { children: React.ReactNode }) => (
        <Card>
            <CardContent className="p-6">{children}</CardContent>
        </Card>
    )

    if (error) {
        return <CardWrapper><div className="text-center text-red-500">{error}</div></CardWrapper>
    }

    if (loading || !metrics) {
        return (
            <CardWrapper>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    ))}
                </div>
            </CardWrapper>
        )
    }

    const getGrowthColor = (value: number) => value > 0 ? 'text-green-500' : 'text-red-500'

    const statsGroups = [
        [
            { label: 'Market Cap', value: format.marketCap(metrics.marketCapitalization) },
            { label: '52 Week Range', value: `${format.price(metrics["52WeekLow"])} - ${format.price(metrics["52WeekHigh"])}` },
            { label: 'Beta', value: format.number(metrics.beta) }
        ],
        [
            { label: 'PE Ratio (TTM)', value: format.number(metrics.peTTM) },
            { label: 'EPS (TTM)', value: format.price(metrics.epsTTM) },
            { label: 'Dividend Yield', value: format.percent(metrics.dividendYieldIndicatedAnnual) }
        ],
        [
            { label: '10D Avg Volume', value: format.volume(metrics["10DayAverageTradingVolume"]) },
            { label: '3M Avg Volume', value: format.volume(metrics["3MonthAverageTradingVolume"]) },
            { label: 'Profit Margin', value: format.percent(metrics.netProfitMarginTTM) }
        ],
        [
            { label: 'EPS Growth YoY', value: format.percent(metrics.epsGrowthTTMYoy), className: getGrowthColor(metrics.epsGrowthTTMYoy) },
            { label: 'Revenue Growth YoY', value: format.percent(metrics.revenueGrowthTTMYoy), className: getGrowthColor(metrics.revenueGrowthTTMYoy) },
            { label: 'Annual EPS', value: format.price(metrics.epsAnnual) }
        ]
    ]

    return (
        <CardWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsGroups.map((group, i) => (
                    <div key={i} className="space-y-4">
                        {group.map((stat, j) => (
                            <StatItem key={j} {...stat} />
                        ))}
                    </div>
                ))}
            </div>
        </CardWrapper>
    )
}
