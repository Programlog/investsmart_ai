"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Trash2 } from "lucide-react"
import Link from 'next/link'
import { useWatchlist } from "@/hooks/use-watchlist"

export default function WatchlistTab() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { watchlist, isLoading, handleRefresh, handleRemoveStock } = useWatchlist()

    const onRefresh = async () => {
        setIsRefreshing(true)
        await handleRefresh()
        setIsRefreshing(false)
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
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
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
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : watchlist.length === 0 ? (
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