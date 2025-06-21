"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface TodoChartProps {
  data: {
    completed: number
    pending: number
    priorityBreakdown: {
      urgent: number
      high: number
      medium: number
      low: number
    }
  }
}

const COLORS = {
  completed: "#10b981",
  pending: "#3b82f6",
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
}

export function TodoChart({ data }: TodoChartProps) {
  const statusData = [
    { name: "Completed", value: data.completed, color: COLORS.completed },
    { name: "Pending", value: data.pending, color: COLORS.pending },
  ]

  const priorityData = [
    { name: "Urgent", value: data.priorityBreakdown.urgent, color: COLORS.urgent },
    { name: "High", value: data.priorityBreakdown.high, color: COLORS.high },
    { name: "Medium", value: data.priorityBreakdown.medium, color: COLORS.medium },
    { name: "Low", value: data.priorityBreakdown.low, color: COLORS.low },
  ].filter((item) => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-slate-600 mb-3">Completion Status</h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {priorityData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-3">Priority Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
