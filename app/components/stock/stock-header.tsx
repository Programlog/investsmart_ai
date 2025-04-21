import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StockHeader({ data }: { data: any }) {
    const isPositiveChange = data.change >= 0
    const isPositiveAfterHours = data.afterHoursChange && data.afterHoursChange >= 0

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-1">
                <div className="text-sm text-muted-foreground">
                    {data.exchange} - {data.exchange} Real Time Price • {data.currency}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        {data.name} ({data.symbol})
                    </h1>
                    <Button variant="outline" size="sm" className="h-8">
                        <Star className="mr-2 h-4 w-4" />
                        Following
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        Compare
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{data.price.toFixed(2)}</span>
                        <div className={`ml-3 flex items-center text-lg ${isPositiveChange ? "text-green-600" : "text-red-600"}`}>
                            {isPositiveChange ? (
                                <ArrowUpRight className="h-5 w-5 mr-1" />
                            ) : (
                                <ArrowDownRight className="h-5 w-5 mr-1" />
                            )}
                            <span className="font-medium">
                                {isPositiveChange ? "+" : ""}
                                {data.change.toFixed(2)}
                            </span>
                            <span className="ml-1 font-medium">
                                ({isPositiveChange ? "+" : ""}
                                {data.changePercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        At close: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at
                        4:00:00 PM EDT
                    </p>
                </div>

                {data.afterHoursPrice && (
                    <div>
                        <div className="flex items-baseline">
                            <span className="text-2xl font-medium">{data.afterHoursPrice.toFixed(2)}</span>
                            <div className={`ml-3 flex items-center ${isPositiveAfterHours ? "text-green-600" : "text-red-600"}`}>
                                {isPositiveAfterHours ? (
                                    <ArrowUpRight className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 mr-1" />
                                )}
                                <span>
                                    {isPositiveAfterHours ? "+" : ""}
                                    {data.afterHoursChange.toFixed(2)}
                                </span>
                                <span className="ml-1">
                                    ({isPositiveAfterHours ? "+" : ""}
                                    {data.afterHoursChangePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            After hours: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                            at 7:59:41 PM EDT
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help rounded-md px-3 py-1 text-sm">
                                <Info className="h-3.5 w-3.5 mr-1" />
                                Time to buy {data.symbol}?
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Get AI-powered investment advice</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
