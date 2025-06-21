"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const mockProductivityData = [
  { week: "Week 1", completed: 12, created: 15, efficiency: 80 },
  { week: "Week 2", completed: 18, created: 20, efficiency: 90 },
  { week: "Week 3", completed: 15, created: 18, efficiency: 83 },
  { week: "Week 4", completed: 22, created: 25, efficiency: 88 },
  { week: "Week 5", completed: 20, created: 22, efficiency: 91 },
  { week: "Week 6", completed: 25, created: 28, efficiency: 89 },
  { week: "Week 7", completed: 30, created: 32, efficiency: 94 },
]

export function ProductivityChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${
                entry.dataKey === "efficiency" ? "Efficiency" : entry.dataKey === "completed" ? "Completed" : "Created"
              }: ${entry.value}${entry.dataKey === "efficiency" ? "%" : ""}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-slate-600 mb-3">Task Creation vs Completion</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockProductivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="created" fill="#3b82f6" name="Created" radius={[2, 2, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-600 mb-3">Efficiency Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockProductivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
