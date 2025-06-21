"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface ExecutiveChartProps {
  data: {
    priorityBreakdown: {
      critical: number
      high: number
      medium: number
      low: number
    }
    statusBreakdown: {
      not_started: number
      in_progress: number
      review: number
      completed: number
      blocked: number
    }
    completionRate: number
    budgetUtilization: number
  }
}

const PRIORITY_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#2563eb",
  low: "#16a34a",
}

const STATUS_COLORS = {
  not_started: "#6b7280",
  in_progress: "#2563eb",
  review: "#ca8a04",
  completed: "#16a34a",
  blocked: "#dc2626",
}

export function ExecutiveChart({ data }: ExecutiveChartProps) {
  const priorityData = Object.entries(data.priorityBreakdown).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
  }))

  const statusData = Object.entries(data.statusBreakdown).map(([status, count]) => ({
    name: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-900 font-medium">{`${payload[0].payload.name}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Priority Distribution</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Status Overview</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
