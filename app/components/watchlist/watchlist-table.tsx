import { WatchlistTableRow } from "./watchlist-table-row"
import { WatchlistLoading } from "./watchlist-loading"
import { WatchlistEmpty } from "./watchlist-empty"

type WatchlistStock = {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

interface WatchlistTableProps {
    watchlist: WatchlistStock[]
    isLoading: boolean
    handleRemoveStock: (symbol: string) => void
}

export function WatchlistTable({ watchlist, isLoading, handleRemoveStock }: WatchlistTableProps) {
    return (
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
                            <WatchlistLoading />
                        ) : watchlist.length === 0 ? (
                            <WatchlistEmpty />
                        ) : (
                            watchlist.map((stock) => (
                                <WatchlistTableRow
                                    key={stock.symbol}
                                    stock={stock}
                                    handleRemoveStock={handleRemoveStock}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 