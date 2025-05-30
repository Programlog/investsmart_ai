import DashboardHeader from "@/components/common/dashboard-header"
import { DashboardSidebarNav } from "@/components/common/DashboardSidebarNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebarNav />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 