'use client'

import useSWR from 'swr'
import { getWatchlist, removeFromWatchlist } from '@/actions/watchlist'

type WatchlistStock = {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useWatchlist() {
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
        { refreshInterval: 60000 } // Refresh every 60 seconds
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
        } catch (err) {
            console.error('Failed to refresh watchlist:', err)
        }
    }

    const handleRemoveStock = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol)
            await mutateWatchlist()
        } catch (err) {
            console.error('Failed to remove stock from watchlist:', err)
        }
    }

    return {
        watchlist,
        isLoading: isWatchlistLoading || isMarketLoading,
        handleRefresh,
        handleRemoveStock
    }
}