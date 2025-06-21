const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }
  return null
}

const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    "Accept": "application/json",
  }
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }
  
  return headers
}

export interface Todo {
  id: number
  title: string
  description: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  priority_color?: string
  status_color?: string
  due_date: string | null
  is_overdue?: boolean
  is_due_today?: boolean
  pdf_url: string | null
  pdf_original_name: string | null
  pdfs: Array<{
    id: number
    todo_id: number
    pdf_path: string
    original_name: string
    file_size: number
    mime_type: string
    created_at: string
    updated_at: string
  }>
  created_at: string
  updated_at: string
}



export interface CreateTodoData {
  title: string
  description: string
  status: 'pending'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  pdf?: File
}

export interface UpdateTodoData {
  title?: string
  description?: string
  status?: 'pending' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  pdf?: File
}


export interface TodosResponse {
  data: Todo[]
  links: any
  meta: any
}

export async function register(userData: {
  first_name: string
  last_name: string
  company?: string
  email: string
  password: string
  password_confirmation: string
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Registration validation errors:", errorData)
      
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.cause = errorData
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error("Error registering:", error)
    throw error
  }
}

export async function verifyOtp(email: string, otpCode: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        email: email,
        otp_code: otpCode 
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.cause = errorData
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error("Error verifying OTP:", error)
    throw error
  }
}

export async function resendOtp(email: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.cause = errorData
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error("Error resending OTP:", error)
    throw error
  }
}

export async function login(email: string, password: string): Promise<{token: string, user: any}> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.cause = errorData
      throw error
    }

    return await response.json()
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.removeItem('user_data')
    }
  } catch (error) {
    console.error("Error logging out:", error)
    throw error
  }
}

export async function fetchTodos(params?: {
  page?: number
  per_page?: number
  status?: 'pending' | 'completed'
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}): Promise<TodosResponse> {
  try {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `${API_BASE_URL}/todos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching todos:", error)
    throw error
  }
}

export async function createTodo(todoData: CreateTodoData): Promise<Todo> {
  try {
    let body: any
    let headers: HeadersInit

    if (todoData.pdf) {
      const formData = new FormData()
      formData.append('title', todoData.title)
      formData.append('description', todoData.description)
      formData.append('status', 'pending')
      formData.append('pdf', todoData.pdf)
      
      body = formData
      headers = createHeaders()
    } else {
      body = JSON.stringify({
        title: todoData.title,
        description: todoData.description,
        status: 'pending'
      })
      headers = {
        ...createHeaders(),
        "Content-Type": "application/json"
      }
    }

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers,
      body,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error("Error creating todo:", error)
    throw error
  }
}

export async function updateTodo(id: number, todoData: UpdateTodoData): Promise<Todo> {
  try {
    let body: any
    let headers: HeadersInit
    let response: Response

    if (todoData.pdf) {
      // Use FormData with method spoofing for file uploads
      const formData = new FormData()
      formData.append('_method', 'PUT') // Method spoofing
      if (todoData.title) formData.append('title', todoData.title)
      if (todoData.description) formData.append('description', todoData.description)
      if (todoData.status) formData.append('status', todoData.status)
      if (todoData.priority) formData.append('priority', todoData.priority)
      if (todoData.due_date) formData.append('due_date', todoData.due_date)
      formData.append('pdf', todoData.pdf)
      
      body = formData
      headers = createHeaders()
      
      // Use POST with method spoofing for file uploads
      response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "POST", // Changed from PUT to POST
        headers,
        body,
      })
    } else {
      // Use JSON for text-only updates
      body = JSON.stringify(todoData)
      headers = {
        ...createHeaders(),
        "Content-Type": "application/json"
      }
      
      response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers,
        body,
      })
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error("Error updating todo:", error)
    throw error
  }
}


export async function markTodoComplete(id: number): Promise<Todo> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        ...createHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "completed" }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error("Error marking todo as complete:", error)
    throw error
  }
}

export async function fetchTodo(id: number): Promise<Todo> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error("Error fetching todo:", error)
    throw error
  }
}

export async function deleteTodo(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error deleting todo:", error)
    throw error
  }
}

export async function bulkDeleteTodos(ids: number[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/bulk-delete`, {
      method: "DELETE",
      headers: {
        ...createHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error bulk deleting todos:", error)
    throw error
  }
}

export async function downloadTodoPDF(id: number): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}/download-pdf`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.blob()
  } catch (error) {
    console.error("Error downloading PDF:", error)
    throw error
  }
}

export async function toggleTodoStatus(id: number, completed: boolean): Promise<Todo> {
  const status = completed ? 'completed' : 'pending'
  return await updateTodo(id, { status })
}
