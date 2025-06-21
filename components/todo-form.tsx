"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TodoFormProps {
  initialData?: {
    title: string
    description: string
    priority: "high" | "medium" | "low"
    pdf_file?: string
  }
  onSubmit: (data: { title: string; description: string; priority: string; pdf_file?: File }) => Promise<void>
  submitLabel: string
  isLoading: boolean
}

export function TodoForm({ initialData, onSubmit, submitLabel, isLoading }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "medium",
    pdf_file: undefined as File | undefined,
  })
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file only.",
          variant: "destructive",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setFormData((prev) => ({ ...prev, pdf_file: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter todo title..."
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Enter todo description..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pdf">PDF Attachment (Optional)</Label>
        {initialData?.pdf_file && !formData.pdf_file && (
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Current file: {initialData.pdf_file}</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {formData.pdf_file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, pdf_file: undefined }))}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {formData.pdf_file && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {formData.pdf_file.name}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
