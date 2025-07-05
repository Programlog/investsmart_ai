import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { InvestmentProfile } from "@/types/stock"

interface AssistantInvestmentProfileProps {
  investmentProfile: InvestmentProfile | null
  profileLoading: boolean
  profileError: string | null
  onRegenerateProfile: () => void
}

export default function AssistantInvestmentProfile({
  investmentProfile,
  profileLoading,
  profileError,
  onRegenerateProfile
}: AssistantInvestmentProfileProps) {
  
  // Renders the allocation bars for the investment profile
  const renderAllocationBar = (value: number, label: string, color: string) => (
    <div className="flex items-center gap-2 mt-1">
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-500 ease-in-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground min-w-[70px] text-right">
        {value}% {label}
      </span>
    </div>
  )

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Investment Profile</CardTitle>
          <CardDescription>Your personalized investment profile</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerateProfile}
          disabled={profileLoading}
        >
          <RefreshCw className={cn("h-4 w-4", profileLoading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        {profileError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {profileError}
            </AlertDescription>
          </Alert>
        ) : profileLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-2 bg-muted rounded w-full mt-4"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        ) : investmentProfile ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Risk Tolerance</h3>
              <p className="text-sm text-muted-foreground">{investmentProfile.risk_tolerance}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Investment Goals</h3>
              <p className="text-sm text-muted-foreground">{investmentProfile.investment_goals}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Time Horizon</h3>
              <p className="text-sm text-muted-foreground">{investmentProfile.time_horizon} years</p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Recommended Allocation</h3>
              {renderAllocationBar(investmentProfile.recommended_allocation.stocks, "Stocks", "bg-blue-500")}
              {renderAllocationBar(investmentProfile.recommended_allocation.bonds, "Bonds", "bg-purple-500")}
              {renderAllocationBar(investmentProfile.recommended_allocation.cash, "Cash", "bg-green-500")}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Complete the questionnaire to generate your investment profile
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={onRegenerateProfile}
            >
              Generate Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 