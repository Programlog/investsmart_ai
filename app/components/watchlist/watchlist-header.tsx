import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface WatchlistHeaderProps {
    isRefreshing: boolean
    onRefresh: () => void
}

export function WatchlistHeader({ isRefreshing, onRefresh }: WatchlistHeaderProps) {
    return (
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
    )
} 