"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ResourceAllocationProps {
  data: Record<string, number>
}

export function ResourceAllocation({ data }: ResourceAllocationProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0)

  const sortedData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Show top 8 departments

  const getUtilizationLevel = (percentage: number) => {
    if (percentage >= 20) return { level: "High", color: "bg-red-100 text-red-700 border-red-200" }
    if (percentage >= 10) return { level: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" }
    return { level: "Low", color: "bg-green-100 text-green-700 border-green-200" }
  }

  return (
    <div className="space-y-4">
      {sortedData.map(([department, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        const utilization = getUtilizationLevel(percentage)

        return (
          <div key={department} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 truncate">{department}</span>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${utilization.color}`}>{utilization.level}</Badge>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{percentage}% of total initiatives</span>
                <span>{count} active</span>
              </div>
            </div>
          </div>
        )
      })}

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No resource allocation data available</p>
        </div>
      )}
    </div>
  )
}
