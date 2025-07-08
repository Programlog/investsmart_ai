'use client'

import DashboardHeader from "@/components/common/dashboard-header"
import { DashboardSidebarNav } from "@/components/common/DashboardSidebarNav"
import { MobileNavbar } from "@/components/common/MobileNavbar"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen">
      {!isMobile && <DashboardSidebarNav />}
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-6 pb-20">{/* Add pb-20 for mobile navbar space */}
          {children}
        </main>
        {isMobile && <MobileNavbar />}
      </div>
    </div>
  )
} 