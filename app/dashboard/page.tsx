"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
import { DashboardSidebarNav } from "@/components/common/DashboardSidebarNav"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("portfolio")

  // Handle tab change from sidebar
  const handleTabChangeAction = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebarNav
        defaultTab={activeTab}
        onTabChangeAction={handleTabChangeAction}
      />

      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <Tabs value={activeTab} className="w-full">
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
    </div>
  )
}

