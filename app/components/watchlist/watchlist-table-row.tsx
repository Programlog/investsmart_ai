import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type WatchlistStock = {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
}

interface WatchlistTableRowProps {
    stock: WatchlistStock
    handleRemoveStock: (symbol: string) => void
}

export function WatchlistTableRow({ stock, handleRemoveStock }: WatchlistTableRowProps) {
    return (
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
    )
} 