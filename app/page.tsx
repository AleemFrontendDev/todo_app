"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  Upload,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Target,
  DollarSign,
  Briefcase,
  User,
  ChevronDown,
  Building,
  LogOut,
  Download,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  markTodoComplete,
  downloadTodoPDF,
  bulkDeleteTodos,
  logout,
  type Todo,
  type CreateTodoData,
  type UpdateTodoData,
  type TodosResponse
} from "@/lib/api"

interface TodoFormData {
  title: string
  description: string
  priority: string
  due_date: string
  pdf?: File
}

export default function EnterpriseTodoDashboard() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  })
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedTodos, setSelectedTodos] = useState<number[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const analytics = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((t) => t.status === 'completed').length
    const pending = todos.filter((t) => t.status === 'pending').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      completionRate,
    }
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (!todos || todos.length === 0) return []
    return todos.filter((todo) => {
      const searchMatch =
        searchQuery === "" ||
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase())

      const statusMatch = filterStatus === "all" || 
        (filterStatus === "completed" && todo.status === "completed") ||
        (filterStatus === "pending" && todo.status === "pending")

      return searchMatch && statusMatch
    })
  }, [todos, searchQuery, filterStatus])

  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch {
      return ""
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const loadTodos = async () => {
    try {
      setLoading(false)
      const response: TodosResponse = await fetchTodos({
        search: searchQuery || undefined,
        status: filterStatus !== "all" ? (filterStatus as 'pending' | 'completed') : undefined,
      })
      setTodos(response.data)
    } catch (error) {
      toast({
        title: "Error Loading Todos",
        description: "Failed to load todos. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTodo = async (data: TodoFormData) => {
    try {
      setUploading(true)
      const createData: CreateTodoData = {
        title: data.title,
        description: data.description,
        status: 'pending',
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        due_date: data.due_date || null,
        pdf: data.pdf,
      }

      const newTodo = await createTodo(createData)
      setTodos((prev) => [newTodo, ...prev])
      setIsAddDialogOpen(false)
      setFormData({ title: "", description: "", priority: "medium", due_date: "" })

      toast({
        title: "Todo Created Successfully",
        description: "New todo has been added to your list.",
      })
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Unable to create todo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateTodo = async (id: number, data: TodoFormData) => {
    try {
      setUploading(true)
      const updateData: UpdateTodoData = {
        title: data.title,
        description: data.description,
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        due_date: data.due_date || null,
        pdf: data.pdf,
      }

      const updatedTodo = await updateTodo(id, updateData)
      
      await loadTodos()
      
      setIsEditDialogOpen(false)
      setEditingTodo(null)
      setFormData({ title: "", description: "", priority: "medium", due_date: "" })

      toast({
        title: "Todo Updated Successfully",
        description: "Todo has been updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update todo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
      toast({
        title: "Todo Deleted",
        description: "Todo has been removed from your list.",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete todo. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePDF = async (todoId: number, pdfId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/todos/${todoId}/delete-pdf`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pdf_id: pdfId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId 
            ? { ...todo, pdfs: todo.pdfs?.filter(pdf => pdf.id !== pdfId) || [] }
            : todo
        )
      )
      
      if (editingTodo && editingTodo.id === todoId) {
        setEditingTodo(prevEditingTodo => ({
          ...prevEditingTodo!,
          pdfs: prevEditingTodo!.pdfs?.filter(pdf => pdf.id !== pdfId) || []
        }))
      }
      
      toast({
        title: "PDF Deleted",
        description: "PDF attachment has been removed.",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const todo = todos.find((t) => t.id === id)
      if (!todo) return

      if (todo.status === 'pending') {
        const updatedTodo = await markTodoComplete(id)
        setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
        toast({
          title: "Todo Completed",
          description: "Todo marked as completed.",
        })
      } else {
        const updatedTodo = await updateTodo(id, { status: 'pending' })
        setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
        toast({
          title: "Todo Reopened",
          description: "Todo marked as pending.",
        })
      }
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: "Unable to update todo status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Format",
          description: "Only PDF files are accepted.",
          variant: "destructive",
        })
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Size Exceeded",
          description: "File size must be under 20MB.",
          variant: "destructive",
        })
        return
      }
      setFormData((prev) => ({ ...prev, pdf: file }))
    }
  }

  const handleDownloadPDF = async (todoId: number, filename: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todos/${todoId}/download-pdf`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
          "Accept": "application/pdf",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority || "medium",
      due_date: formatDateForInput(todo.due_date),
    })
    setIsEditDialogOpen(true)
  }

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteTodos(selectedTodos)
      setTodos((prev) => prev.filter((todo) => !selectedTodos.includes(todo.id)))
      setSelectedTodos([])
      toast({
        title: "Todos Deleted",
        description: `${selectedTodos.length} todos have been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Bulk Delete Failed",
        description: "Unable to delete selected todos. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.removeItem('user_data')
      
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      
      toast({
        title: "Logged Out Successfully",
        description: "You have been signed out of your account.",
      })
      
      router.push('/login')
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Unable to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCurrentPDF = (todo: Todo | null) => {
    if (todo && todo.pdfs && todo.pdfs.length > 0) {
      return todo.pdfs[0]
    }
    return null
  }

  useEffect(() => {
    loadTodos()
  }, [searchQuery, filterStatus])

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUserData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data')
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData)
          setUserData(parsedUserData)
        }
      } catch (error) {
        // Silent error handling
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-300 border-t-transparent animate-ping mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Todo Dashboard</h3>
          <p className="text-gray-600">Initializing your task management system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
                  <p className="text-sm text-gray-600">Professional Task Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-900 hover:bg-gray-50">
                    <User className="w-4 h-4 mr-2" />
                    {userData ? `${userData.first_name} ${userData.last_name}` : 'User'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 shadow-lg">
                  {userData && (
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userData.first_name} {userData.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                      {userData.company && (
                        <p className="text-xs text-gray-500">{userData.company}</p>
                      )}
                    </div>
                  )}
                  <DropdownMenuItem 
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Todos</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{analytics.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{analytics.completionRate}%</div>
              <div className="flex items-center mt-2">
                <Progress value={analytics.completionRate} className="flex-1 h-2" />
                <span className="text-xs text-gray-500 ml-2">
                  {analytics.completed}/{analytics.total}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Task Overview</CardTitle>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">{analytics.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Completed:</span>
                  <span className="font-semibold text-green-600">{analytics.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600">Pending:</span>
                  <span className="font-semibold text-orange-600">{analytics.pending}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status Distribution</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{analytics.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{analytics.pending}</span>
                </div>
                <div className="mt-3">
                  <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.total > 0 ? (analytics.completed / analytics.total) * 100 : 0}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500 h-full transition-all duration-300"
                      style={{ width: `${analytics.total > 0 ? (analytics.pending / analytics.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-gray-300"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {selectedTodos.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedTodos.length})
            </Button>
          )}
        </div>

        <Tabs defaultValue="todos" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-100 border-gray-200">
              <TabsTrigger
                value="todos"
                className="data-[state=active]:bg-gradient-to-r from-blue-600 to-indigo-600 data-[state=active]:text-white text-gray-700"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Todos
              </TabsTrigger>
            </TabsList>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Todo
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <TabsContent value="todos" className="space-y-6">
            <div className="space-y-4">
              {filteredTodos.length === 0 ? (
                <Card className="bg-white border-gray-200 shadow-lg text-center py-16">
                  <CardContent>
                    <div className="text-gray-400 mb-6">
                      <Briefcase className="w-20 h-20 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Todos Found</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first todo to begin managing your tasks.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Todo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredTodos.map((todo) => {
                  const currentPDF = getCurrentPDF(todo)
                  return (
                    <Card
                      key={todo.id}
                      className={`bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        todo.status === 'completed' ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedTodos.includes(todo.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTodos(prev => [...prev, todo.id])
                                } else {
                                  setSelectedTodos(prev => prev.filter(id => id !== todo.id))
                                }
                              }}
                              className="mt-2"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(todo.id)}
                              className={`mt-1 p-2 h-8 w-8 rounded-full ${
                                todo.status === 'completed'
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : "bg-red-500 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              {todo.status === 'completed' && <Check className="w-4 h-4" />}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <CardTitle
                                  className={`text-lg font-semibold ${
                                    todo.status === 'completed' ? "line-through text-gray-500" : "text-gray-900"
                                  }`}
                                >
                                  {todo.title}
                                </CardTitle>
                              </div>
                              <CardDescription
                                className={`text-sm leading-relaxed mb-3 ${
                                  todo.status === 'completed' ? "line-through text-gray-500" : "text-gray-600"
                                }`}
                              >
                                {todo.description}
                              </CardDescription>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="text-xs text-gray-500">
                                  Created: {formatDate(todo.created_at)}
                                </div>
                                {todo.due_date && (
                                  <div className="text-xs text-gray-500">
                                    • Due: {formatDate(todo.due_date)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {todo.priority && (
                              <Badge className={getPriorityColor(todo.priority)}>
                                <span className="mr-1">{getPriorityIcon(todo.priority)}</span>
                                {todo.priority.toUpperCase()}
                              </Badge>
                            )}
                            {todo.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                COMPLETED
                              </Badge>
                            )}
                            {currentPDF && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 bg-gray-50 text-blue-600 border-gray-300"
                              >
                                <FileText className="w-3 h-3" />
                                PDF
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {currentPDF && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-sm flex-1">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div className="flex-1">
                                  <span className="text-blue-600 font-medium">{currentPDF.original_name}</span>
                                  <div className="text-xs text-gray-500">
                                    {(currentPDF.file_size / 1024).toFixed(1)} KB • {new Date(currentPDF.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(todo.id, currentPDF.original_name)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(todo.id)}
                            className={`${
                              todo.status === 'completed'
                                ? "text-orange-600 border-orange-200 hover:bg-orange-50 bg-white"
                                : "text-green-600 border-green-200 hover:bg-green-50 bg-white"
                            }`}
                          >
                            {todo.status === 'completed' ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Mark Pending
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(todo)}
                            className="text-blue-600 border-gray-300 hover:bg-gray-50 bg-white"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 bg-white"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-gray-200 shadow-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                  Delete Todo
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                  Are you sure you want to delete "{todo.title}"? This action cannot be undone and will remove all attachments.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete Todo
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Create New Todo</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new todo to your task list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter todo title..."
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter todo description..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="font-medium text-gray-700">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="urgent" className="text-gray-700">
                        🔴 Urgent Priority
                      </SelectItem>
                      <SelectItem value="high" className="text-gray-700">
                        🟠 High Priority
                      </SelectItem>
                      <SelectItem value="medium" className="text-gray-700">
                        🟡 Medium Priority
                      </SelectItem>
                      <SelectItem value="low" className="text-gray-700">
                        🟢 Low Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due_date" className="font-medium text-gray-700">
                    Due Date
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pdf" className="font-medium text-gray-700">
                  PDF Attachment (Optional)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="bg-white border-gray-300 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {formData.pdf && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, pdf: undefined }))}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {formData.pdf && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 bg-gray-50 p-2 rounded border border-gray-200">
                    <FileText className="w-4 h-4" />
                    {formData.pdf.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setFormData({ title: "", description: "", priority: "medium", due_date: "" })
                }}
                className="border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleCreateTodo(formData)}
                disabled={!formData.title.trim() || !formData.description.trim() || uploading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Todo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Todo</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update your todo details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="edit-title"
                  placeholder="Enter todo title..."
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter todo description..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority" className="font-medium text-gray-700">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="urgent" className="text-gray-700">
                        🔴 Urgent Priority
                      </SelectItem>
                      <SelectItem value="high" className="text-gray-700">
                        🟠 High Priority
                      </SelectItem>
                      <SelectItem value="medium" className="text-gray-700">
                        🟡 Medium Priority
                      </SelectItem>
                      <SelectItem value="low" className="text-gray-700">
                        🟢 Low Priority
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-due_date" className="font-medium text-gray-700">
                    Due Date
                  </Label>
                  <Input
                    id="edit-due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-pdf" className="font-medium text-gray-700">
                  PDF Attachment
                </Label>
                
                {editingTodo && getCurrentPDF(editingTodo) && !formData.pdf && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>Current file: {getCurrentPDF(editingTodo)?.original_name}</span>
                        <span className="text-xs text-gray-400">
                          ({((getCurrentPDF(editingTodo)?.file_size || 0) / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePDF(editingTodo.id, getCurrentPDF(editingTodo)!.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {formData.pdf && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <FileText className="w-4 h-4" />
                        <span>New file: {formData.pdf.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData((prev) => ({ ...prev, pdf: undefined }))}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Input
                  id="edit-pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-white border-gray-300 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500">
                  {formData.pdf 
                    ? "This will replace the current PDF attachment." 
                    : getCurrentPDF(editingTodo) 
                      ? "Upload a new PDF file to replace the current one, or click X to remove the current file."
                      : "Upload a PDF file to attach to this todo."
                  }
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingTodo(null)
                  setFormData({ title: "", description: "", priority: "medium", due_date: "" })
                }}
                className="border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleUpdateTodo(editingTodo!.id, formData)}
                disabled={!formData.title.trim() || !formData.description.trim() || uploading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update Todo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  )
}
