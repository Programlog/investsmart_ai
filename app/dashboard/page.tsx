import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/common/dashboard-header"
import {
  SearchTab,
  PortfolioTab,
  MarketTab,
  AssistantTab,
  LearningTab,
  NewsTab,
  WatchlistTab
} from "@/components/dashboard"
import { currentUser } from "@clerk/nextjs/server"

export default async function DashboardPage() {
  const user = await currentUser()
  const firstName = user?.firstName

  const welcomePrefix = firstName ? `${firstName}'s` : 'Your'

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{welcomePrefix} Investment Dashboard</h1>
            <p className="text-muted-foreground mt-1">View your personalized investment profile and recommendations</p>
          </div>
        </div>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full mb-6">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <SearchTab />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>

          <TabsContent value="watchlist">
            <WatchlistTab />
          </TabsContent>

          <TabsContent value="market">
            <MarketTab />
          </TabsContent>

          <TabsContent value="assistant">
            <AssistantTab />
          </TabsContent>

          <TabsContent value="learning">
            <LearningTab />
          </TabsContent>

          <TabsContent value="news">
            <NewsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

