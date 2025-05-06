'use client'

import useSWR from 'swr'
import { getWatchlist, removeFromWatchlist } from '@/actions/watchlist'
import { useToast } from '@/hooks/use-toast'

type WatchlistStock = {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWatchlist() {
    const { toast } = useToast()

    // Fetch watchlist data from server
    const { data: watchlistData, mutate: mutateWatchlist, isLoading: isWatchlistLoading } = useSWR(
        '/api/watchlist',
        () => getWatchlist(),
        { refreshInterval: 30000 } // Refresh every 30 seconds
    )

    // Fetch real-time market data for watchlist symbols
    const { data: marketData, mutate: mutateMarket, isLoading: isMarketLoading } = useSWR(
        watchlistData?.length ?
            `/api/market/multi-stock?symbols=${watchlistData.map((item: any) => item.symbol).join(',')}`
            : null,
        fetcher,
        { refreshInterval: 30000 }
    )

    // Combine watchlist and market data
    const watchlist: WatchlistStock[] = watchlistData?.map((item: any) => {
        const bar = marketData?.bars?.[item.symbol]
        return {
            symbol: item.symbol,
            name: item.symbol, // We could fetch company names from another API if needed
            price: bar?.c || 0,
            change: bar ? bar.c - bar.o : 0,
            changePercent: bar ? ((bar.c - bar.o) / bar.o) * 100 : 0
        }
    }) || []

    const handleRefresh = async () => {
        try {
            await Promise.all([
                mutateWatchlist(),
                mutateMarket()
            ])
            toast({
                title: "Watchlist refreshed",
                description: "Latest market data has been fetched."
            })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to refresh watchlist data",
                variant: "destructive"
            })
        }
    }

    const handleRemoveStock = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol)
            await mutateWatchlist()
            toast({
                title: "Stock removed",
                description: `${symbol} has been removed from your watchlist.`
            })
        } catch (err) {
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to remove stock from watchlist",
                variant: "destructive"
            })
        }
    }

    return {
        watchlist,
        isLoading: isWatchlistLoading || isMarketLoading,
        handleRefresh,
        handleRemoveStock
    }
}