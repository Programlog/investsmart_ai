import { Card, CardContent } from "@/components/ui/card"

export default function StockStats({ data }: { data: any }) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Previous Close</h3>
                            <p className="text-base">{data.previousClose.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Open</h3>
                            <p className="text-base">{data.open.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Day's Range</h3>
                            <p className="text-base">
                                {data.dayRange.low.toFixed(2)} - {data.dayRange.high.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">52 Week Range</h3>
                            <p className="text-base">
                                {data.weekRange.low.toFixed(2)} - {data.weekRange.high.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Market Cap</h3>
                            <p className="text-base">{data.marketCap}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Beta (5Y Monthly)</h3>
                            <p className="text-base">{(Math.random() * 2 + 0.5).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Volume</h3>
                            <p className="text-base">{data.volume.toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Volume</h3>
                            <p className="text-base">{data.avgVolume.toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">PE Ratio (TTM)</h3>
                            <p className="text-base">{data.peRatio.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">EPS (TTM)</h3>
                            <p className="text-base">{data.eps.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Forward Dividend & Yield</h3>
                            <p className="text-base">
                                {data.dividend.toFixed(2)} ({data.dividendYield.toFixed(2)}%)
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">1y Target Est</h3>
                            <p className="text-base">{data.targetEstimate.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
