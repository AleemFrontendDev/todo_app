"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PerformanceMetricsProps {
  data: {
    completionRate: number
    budgetUtilization: number
    resourceEfficiency: number
    total: number
    completed: number
    inProgress: number
    blocked: number
    overdue: number
  }
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    {
      label: "Completion Rate",
      value: data.completionRate,
      target: 85,
      unit: "%",
      trend: data.completionRate >= 85 ? "up" : data.completionRate >= 70 ? "neutral" : "down",
    },
    {
      label: "Budget Utilization",
      value: data.budgetUtilization,
      target: 90,
      unit: "%",
      trend: data.budgetUtilization >= 90 ? "up" : data.budgetUtilization >= 75 ? "neutral" : "down",
    },
    {
      label: "Resource Efficiency",
      value: data.resourceEfficiency,
      target: 95,
      unit: "%",
      trend: data.resourceEfficiency >= 95 ? "up" : data.resourceEfficiency >= 85 ? "neutral" : "down",
    },
    {
      label: "Active Initiatives",
      value: data.inProgress,
      target: data.total * 0.6,
      unit: "",
      trend: data.inProgress <= data.total * 0.6 ? "up" : "neutral",
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{metric.label}</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-bold ${getTrendColor(metric.trend)}`}>
                {metric.value}
                {metric.unit}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <Progress
              value={metric.unit === "%" ? metric.value : (metric.value / metric.target) * 100}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Target: {metric.target}
                {metric.unit}
              </span>
              <Badge
                variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {metric.trend === "up" ? "On Track" : metric.trend === "down" ? "Below Target" : "Monitoring"}
              </Badge>
            </div>
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Indicators</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{data.blocked}</div>
            <div className="text-xs text-gray-500">Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.overdue}</div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>
      </div>
    </div>
  )
}
