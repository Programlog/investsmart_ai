import { Clock, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import type { NewsItem } from "@/types/stock"

export const NewsItemCard = ({ item }: { item: NewsItem }) => (
    <div className="border-b pb-4 last:border-0 last:pb-0">
        <div className="flex gap-4">
            <div className="relative flex-shrink-0 w-20 h-20">
                <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover rounded-md"
                    sizes="80px"
                    priority={false}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium hover:underline cursor-pointer mb-1">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        {item.title}
                        <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                    </a>
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2 gap-2">
                    <span>{item.source}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
            </div>
        </div>
    </div>
)