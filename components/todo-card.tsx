"use client"

import { useState } from "react"
import { Edit, Trash2, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check } from "lucide-react"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  pdf_file?: string
  created_at: string
  updated_at: string
}

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
}

export function TodoCard({ todo, onEdit, onDelete, onToggleStatus }: TodoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(todo.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        todo.completed ? "bg-green-50 border-green-200" : "bg-white"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(todo.id)}
              className={`mt-1 p-1 h-6 w-6 rounded-full ${
                todo.completed
                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {todo.completed && <Check className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <CardTitle className={`text-lg ${todo.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                {todo.title}
              </CardTitle>
              <CardDescription className={`mt-1 ${todo.completed ? "line-through" : ""}`}>
                {todo.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Created: {formatDate(todo.created_at)}</span>
                {todo.updated_at !== todo.created_at && <span>Updated: {formatDate(todo.updated_at)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todo.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Completed
              </Badge>
            )}
            {todo.pdf_file && (
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                PDF
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {todo.pdf_file && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Attached file:</span>
              <span className="text-blue-600 hover:underline cursor-pointer">{todo.pdf_file}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(todo)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Delete Todo
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
