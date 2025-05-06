"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2 } from "lucide-react"
import Link from 'next/link'
import useSWR from "swr"

type WatchlistStock = {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function WatchlistTab() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])

    // Effect to sync with localStorage
    useEffect(() => {
        const loadWatchlist = async () => {
            try {
                const symbols = JSON.parse(localStorage.getItem('watchlist') || '[]')
                if (symbols.length > 0) {
                    // Fetch latest data for all watchlist stocks
                    const res = await fetch(`/api/market/multi-stock?symbols=${symbols.join(',')}`)
                    const data = await res.json()

                    const stocks: WatchlistStock[] = symbols.map((symbol: string) => {
                        const bar = data.bars?.[symbol]
                        return {
                            symbol,
                            name: symbol, // In a real app, we'd store/fetch the company names
                            price: bar?.c || 0,
                            change: bar ? bar.c - bar.o : 0,
                            changePercent: bar ? ((bar.c - bar.o) / bar.o) * 100 : 0
                        }
                    })
                    setWatchlist(stocks)
                } else {
                    setWatchlist([])
                }
            } catch (err) {
                console.error('Error loading watchlist:', err)
            }
        }

        // Load initial data
        loadWatchlist()

        // Subscribe to storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'watchlist') {
                loadWatchlist()
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const handleRemoveStock = (symbol: string) => {
        try {
            const symbols = JSON.parse(localStorage.getItem('watchlist') || '[]')
            const newSymbols = symbols.filter((s: string) => s !== symbol)
            localStorage.setItem('watchlist', JSON.stringify(newSymbols))
            setWatchlist(watchlist.filter(stock => stock.symbol !== symbol))
        } catch (err) {
            console.error('Error removing stock from watchlist:', err)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            const symbols = watchlist.map(stock => stock.symbol)
            if (symbols.length > 0) {
                const res = await fetch(`/api/market/multi-stock?symbols=${symbols.join(',')}`)
                const data = await res.json()

                const updatedWatchlist = watchlist.map(stock => {
                    const bar = data.bars?.[stock.symbol]
                    if (!bar) return stock

                    return {
                        ...stock,
                        price: bar.c,
                        change: bar.c - bar.o,
                        changePercent: ((bar.c - bar.o) / bar.o) * 100
                    }
                })
                setWatchlist(updatedWatchlist)
            }
        } catch (err) {
            console.error('Error refreshing watchlist:', err)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Followed Stocks</CardTitle>
                        <CardDescription>
                            Track the performance of stocks you're interested in
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="ml-2">Refresh</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-10 px-4 text-left font-medium">Symbol</th>
                                        <th className="h-10 px-4 text-left font-medium">Name</th>
                                        <th className="h-10 px-4 text-right font-medium">Price</th>
                                        <th className="h-10 px-4 text-right font-medium">Change</th>
                                        <th className="h-10 px-4 text-center font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {watchlist.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                You're not following any stocks yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        watchlist.map((stock) => (
                                            <tr key={stock.symbol} className="border-b">
                                                <td className="p-4 font-medium">
                                                    <Link href={`/stock/${stock.symbol}`} className="hover:underline">
                                                        {stock.symbol}
                                                    </Link>
                                                </td>
                                                <td className="p-4">{stock.name}</td>
                                                <td className="p-4 text-right">${stock.price.toFixed(2)}</td>
                                                <td className={`p-4 text-right ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    <div className="flex items-center justify-end">
                                                        {stock.changePercent >= 0 ? (
                                                            <ArrowUpRight className="h-4 w-4 mr-1" />
                                                        ) : (
                                                            <ArrowDownRight className="h-4 w-4 mr-1" />
                                                        )}
                                                        {stock.changePercent.toFixed(2)}%
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveStock(stock.symbol)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}