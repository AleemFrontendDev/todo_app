"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Building, Shield, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login(formData.email, formData.password)
      const storage = formData.rememberMe ? localStorage : sessionStorage
      storage.setItem('auth_token', response.token)
      // console.log("Login response: token", response.token)
      
      if (response.user) {
        storage.setItem('user_data', JSON.stringify(response.user))
        // console.log("Login response: user", response.user)
      }
      const maxAge = formData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 
      document.cookie = `auth_token=${response.token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user?.first_name || 'User'}!`,
      })

      // FIX: Use hard redirect instead of router.push("/")
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 100)
      
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Please check your credentials and try again."
      
      if (error.message.includes("401")) {
        errorMessage = "Invalid email or password."
      } else if (error.message.includes("422")) {
        errorMessage = "Please provide valid email and password."
      } else if (error.message.includes("429")) {
        errorMessage = "Too many login attempts. Please try again later."
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again later."
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection."
      }

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
                <p className="text-gray-600">Strategic Initiative Management</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Manage Strategic Initiatives with Enterprise-Grade Security
              </h2>
              <p className="text-lg text-gray-600">
                Streamline your organization's strategic portfolio with advanced analytics, real-time collaboration, and
                comprehensive reporting capabilities.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">SOC 2 Type II Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Advanced Analytics & Reporting</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Real-time Collaboration</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Enterprise-Grade Security</span>
            </div>
          </div>

          {/* <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trusted by Fortune 500</h3>
            </div>
            <p className="text-gray-600">
              Join thousands of executives who trust our platform to manage their strategic initiatives and drive
              organizational success.
            </p>
          </div> */}
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your enterprise account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      SignUp
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
