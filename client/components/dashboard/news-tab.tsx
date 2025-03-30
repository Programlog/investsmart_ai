"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Share2, ExternalLink, Clock, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type NewsArticle = {
  id: string
  title: string
  summary: string
  content?: string
  source: string
  sourceIcon?: string
  url: string
  publishedAt: string
  category: "stocks" | "bonds" | "crypto" | "economy" | "personal-finance"
  image?: string
  aiSummary?: string
}

export default function NewsTab() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastArticleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore],
  )

  useEffect(() => {
    // Simulate API call to fetch news articles
    const fetchArticles = () => {
      setTimeout(
        () => {
          const newArticles: NewsArticle[] = [
            {
              id: "1",
              title: "Federal Reserve Signals Potential Rate Cuts Later This Year",
              summary:
                "The Federal Reserve has indicated it may begin cutting interest rates later this year as inflation shows signs of cooling.",
              content:
                'The Federal Reserve has signaled a potential shift in monetary policy, indicating it may begin cutting interest rates later this year as inflation shows signs of cooling. During the latest Federal Open Market Committee (FOMC) meeting, officials discussed the possibility of easing their restrictive stance if economic data continues to support such a move.\n\nFed Chair Jerome Powell emphasized that the committee wants to see sustained evidence that inflation is moving toward the 2% target before making any policy changes. "We\'re not declaring victory at all," Powell stated during the press conference. "We need to see more good data."\n\nEconomists are now predicting two to three quarter-point rate cuts before the end of the year, with the first potentially coming as early as September. This represents a significant shift from earlier in the year when high inflation readings had pushed back expectations for any rate cuts.\n\nMarkets reacted positively to the news, with major indices climbing and Treasury yields falling. The prospect of lower interest rates is particularly beneficial for growth stocks and the housing market, which has been under pressure from higher mortgage rates.\n\nHowever, Powell cautioned that the timing and pace of rate cuts would remain data-dependent, and the Fed would not hesitate to maintain higher rates if inflation proves persistent.',
              source: "Bloomberg",
              sourceIcon: "B",
              url: "#",
              publishedAt: "2 hours ago",
              category: "economy",
              image: "/placeholder.svg?height=200&width=400",
              aiSummary:
                "The Federal Reserve has indicated it may begin cutting interest rates later this year as inflation shows signs of moderating. This could potentially lead to 2-3 quarter-point cuts by year-end, with the first possibly coming in September. Markets responded positively, but Fed Chair Powell emphasized that any decisions will remain data-dependent.",
            },
            {
              id: "2",
              title: "Tech Stocks Rally on Strong Earnings Reports",
              summary:
                "Major technology companies reported better-than-expected earnings, driving a rally in the tech sector.",
              source: "CNBC",
              sourceIcon: "C",
              url: "#",
              publishedAt: "4 hours ago",
              category: "stocks",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "3",
              title: "Bitcoin Surges Past $60,000 as Institutional Adoption Grows",
              summary:
                "Bitcoin has surpassed $60,000 for the first time in months as institutional investors continue to enter the cryptocurrency market.",
              source: "CoinDesk",
              sourceIcon: "CD",
              url: "#",
              publishedAt: "6 hours ago",
              category: "crypto",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "4",
              title: "Bond Market Signals Recession Concerns as Yield Curve Inverts",
              summary:
                "The yield curve has inverted again, historically a predictor of economic downturns, raising concerns about a potential recession.",
              source: "Financial Times",
              sourceIcon: "FT",
              url: "#",
              publishedAt: "8 hours ago",
              category: "bonds",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "5",
              title: "New Tax-Advantaged Retirement Accounts: What You Need to Know",
              summary:
                "Recent legislation has introduced new types of tax-advantaged retirement accounts. Here's what investors should understand about these options.",
              source: "Wall Street Journal",
              sourceIcon: "WSJ",
              url: "#",
              publishedAt: "10 hours ago",
              category: "personal-finance",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "6",
              title: "Global Supply Chain Issues Continue to Impact Inflation",
              summary:
                "Ongoing disruptions in global supply chains are contributing to persistent inflation pressures across various sectors.",
              source: "Reuters",
              sourceIcon: "R",
              url: "#",
              publishedAt: "12 hours ago",
              category: "economy",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "7",
              title: "ESG Investing Faces Regulatory Scrutiny Amid Greenwashing Concerns",
              summary:
                "Regulators are increasing oversight of ESG investment products as concerns about greenwashing practices grow.",
              source: "Bloomberg",
              sourceIcon: "B",
              url: "#",
              publishedAt: "14 hours ago",
              category: "stocks",
              image: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "8",
              title: "Housing Market Shows Signs of Cooling as Mortgage Rates Climb",
              summary:
                "The housing market is showing signs of slowing down as mortgage rates reach their highest levels in years.",
              source: "CNBC",
              sourceIcon: "C",
              url: "#",
              publishedAt: "16 hours ago",
              category: "personal-finance",
              image: "/placeholder.svg?height=200&width=400",
            },
          ]

          if (page === 1) {
            setArticles(newArticles)
          } else {
            // Simulate pagination by adding more articles
            const moreArticles = newArticles.map((article) => ({
              ...article,
              id: `${article.id}-${page}`,
              title: `${article.title} (Page ${page})`,
            }))
            setArticles((prev) => [...prev, ...moreArticles])
          }

          setHasMore(page < 3) // Limit to 3 pages for demo
          setIsLoading(false)
          setIsRefreshing(false)
        },
        page === 1 ? 1500 : 1000,
      )
    }

    fetchArticles()
  }, [page])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setPage(1)
    setArticles([])
  }

  const filteredArticles = articles.filter((article) => {
    if (activeCategory === "all") return true
    return article.category === activeCategory
  })

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "stocks":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Stocks</Badge>
      case "bonds":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Bonds</Badge>
      case "crypto":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Crypto</Badge>
      case "economy":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Economy</Badge>
      case "personal-finance":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Personal Finance</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investment News</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
          {isRefreshing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="bonds">Bonds</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="economy">Economy</TabsTrigger>
          <TabsTrigger value="personal-finance">Personal Finance</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading news articles...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredArticles.map((article, index) => {
            const isLastArticle = index === filteredArticles.length - 1
            return (
              <Card key={article.id} className="overflow-hidden" ref={isLastArticle ? lastArticleRef : null}>
                <div className="md:flex">
                  {article.image && (
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${article.image ? "md:w-2/3" : "w-full"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{article.sourceIcon}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{article.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.publishedAt}
                        </div>
                        {getCategoryBadge(article.category)}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedArticle(article)}>
                        Read More
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          Original Source <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {isLoading && page > 1 && (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            </div>
          )}

          {filteredArticles.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No articles found in this category. Try a different category or refresh the page.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{selectedArticle?.sourceIcon}</AvatarFallback>
                </Avatar>
                <span>{selectedArticle?.source}</span>
              </div>
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {selectedArticle?.publishedAt}
              </div>
            </DialogDescription>
          </DialogHeader>

          {selectedArticle?.image && (
            <div className="w-full h-64 mb-4">
              <img
                src={selectedArticle.image || "/placeholder.svg"}
                alt={selectedArticle.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}

          <div className="space-y-4">
            {selectedArticle?.content ? (
              selectedArticle.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-sm">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-sm">{selectedArticle?.summary}</p>
            )}
          </div>

          {selectedArticle?.aiSummary && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <h4 className="text-sm font-medium mb-2">AI Summary</h4>
              <p className="text-sm text-muted-foreground">{selectedArticle.aiSummary}</p>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={selectedArticle?.url} target="_blank" rel="noopener noreferrer">
                Read Original <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

