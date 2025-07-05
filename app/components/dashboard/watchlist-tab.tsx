"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useWatchlist } from "@/hooks/use-watchlist"
import { WatchlistHeader, WatchlistTable } from "@/components/watchlist"

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
                <WatchlistHeader isRefreshing={isRefreshing} onRefresh={onRefresh} />
                <CardContent>
                    <WatchlistTable
                        watchlist={watchlist}
                        isLoading={isLoading}
                        handleRemoveStock={handleRemoveStock}
                    />
                </CardContent>
            </Card>
        </div>
    )
}