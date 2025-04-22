// components/admin/stat-card.tsx

import { ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: number
  isPositiveChangeGood?: boolean
  isLoading?: boolean
}

/**
 * StatCard displays a metric with optional trend indicator
 * Used in dashboard to show key statistics
 */
export function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  isPositiveChangeGood = true,
  isLoading = false 
}: StatCardProps) {
  // Determine if change is positive or negative
  const isPositive = change ? change > 0 : false
  
  // Determine if the change is "good" based on context
  const isGoodChange = isPositiveChangeGood ? isPositive : !isPositive
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change !== undefined && (
                  <div className={`flex items-center text-xs font-medium ${isGoodChange ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-primary/10 p-2 rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}