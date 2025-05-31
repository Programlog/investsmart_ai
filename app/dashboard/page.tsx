import { redirect } from "next/navigation"

export default function DashboardPage() {
  redirect("/dashboard/portfolio") // Redirect to portfolio as the default dashboard view
}