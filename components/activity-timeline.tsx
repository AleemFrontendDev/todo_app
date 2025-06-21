"use client"

import { Clock, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Todo {
  id: number
  title: string
  status: string
  priority: string
  assignee: string
  updated_at: string
  completed: boolean
}

interface ActivityTimelineProps {
  todos: Todo[]
}

export function ActivityTimeline({ todos }: ActivityTimelineProps) {
  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === "blocked") return <AlertTriangle className="w-4 h-4 text-red-600" />
    return <Clock className="w-4 h-4 text-blue-600" />
  }

  const getStatusColor = (status: string, completed: boolean) => {
    if (completed) return "bg-green-100 text-green-700 border-green-200"
    if (status === "blocked") return "bg-red-100 text-red-700 border-red-200"
    if (status === "in_progress") return "bg-blue-100 text-blue-700 border-blue-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {todos.map((todo, index) => (
        <div key={todo.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">{getStatusIcon(todo.status, todo.completed)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">{todo.title}</p>
              <Badge className={`text-xs ${getStatusColor(todo.status, todo.completed)}`}>
                {todo.completed ? "COMPLETED" : todo.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{todo.assignee.split(" (")[0]}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(todo.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {todos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No recent activity</p>
        </div>
      )}
    </div>
  )
}
