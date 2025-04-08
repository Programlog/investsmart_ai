import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import SearchTab from "@/components/dashboard/search-tab"
import PortfolioTab from "@/components/dashboard/portfolio-tab"
import MarketTab from "@/components/dashboard/market-tab"
import AssistantTab from "@/components/dashboard/assistant-tab"
import LearningTab from "@/components/dashboard/learning-tab"
import NewsTab from "@/components/dashboard/news-tab"
import { checkUser } from "@/lib/checkUser"

export default async function DashboardPage() {
  const user = await checkUser()
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
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full mb-6">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
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

