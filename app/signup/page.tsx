"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Building, Shield, ArrowRight, CheckCircle, Users, Award, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/lib/api"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    password: "",
    password_confirmation: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors({})

    if (formData.password !== formData.password_confirmation) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service to continue.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        company: formData.company || undefined,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please check your email for the OTP.",
      })

      localStorage.setItem('registration_email', formData.email)
      router.push("/verify-otp")
      
    } catch (error: any) {
      console.error("Registration error:", error)
      
      if (error.message.includes("422") && error.cause?.errors) {
        setValidationErrors(error.cause.errors)
        toast({
          title: "Validation Failed",
          description: "Please fix the errors below and try again.",
          variant: "destructive",
        })
      } else {
        let errorMessage = "Please check your information and try again."
        
        if (error.message.includes("409")) {
          errorMessage = "Account already exists and is activated. Please login instead."
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection."
        }

        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldError = (fieldName: string): string | null => {
    return validationErrors[fieldName]?.[0] || null
  }

  const hasFieldError = (fieldName: string): boolean => {
    return !!validationErrors[fieldName]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="hidden lg:block space-y-8 pt-8">
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
                Join Leading Organizations in Strategic Excellence
              </h2>
              <p className="text-lg text-gray-600">
                Transform your organization's strategic planning with our enterprise-grade portfolio management platform
                trusted by Fortune 500 companies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Enterprise Security</h3>
              </div>
              <p className="text-gray-600">
                SOC 2 Type II compliant with advanced encryption, SSO integration, and comprehensive audit trails for
                enterprise peace of mind.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
              </div>
              <p className="text-gray-600">
                Real-time collaboration tools, role-based permissions, and integrated communication for seamless
                cross-functional teamwork.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
              </div>
              <p className="text-gray-600">
                Executive dashboards, predictive analytics, and comprehensive reporting to drive data-informed strategic
                decisions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Trusted by Industry Leaders</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Fortune 500 Companies</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Global Enterprises</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Government Agencies</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Healthcare Systems</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
              <CardDescription className="text-gray-600">
                Join thousands of professionals managing their tasks efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(validationErrors).length > 0 && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Please fix the following errors:
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([field, errors]) => (
                        <li key={field} className="text-sm">
                          <strong className="capitalize">{field.replace('_', ' ')}:</strong> {errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-gray-700 font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                      className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 ${
                        hasFieldError('first_name') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                      disabled={isLoading}
                    />
                    {getFieldError('first_name') && (
                      <p className="text-sm text-red-600 mt-1">{getFieldError('first_name')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-gray-700 font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="last_name"
                      placeholder="Smith"
                      value={formData.last_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                      className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 ${
                        hasFieldError('last_name') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
                      disabled={isLoading}
                    />
                    {getFieldError('last_name') && (
                      <p className="text-sm text-red-600 mt-1">{getFieldError('last_name')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-700 font-medium">
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    placeholder="Acme Corporation"
                    value={formData.company}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                    className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 ${
                      hasFieldError('company') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {getFieldError('company') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('company')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 ${
                      hasFieldError('email') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {getFieldError('email') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className={`bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                        hasFieldError('password') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
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
                  {getFieldError('password') && (
                    <p className="text-sm text-red-600 mt-1">{getFieldError('password')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className="text-gray-700 font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                      }
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                      *
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.agreeToMarketing}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, agreeToMarketing: checked as boolean }))
                      }
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <Label htmlFor="marketing" className="text-sm text-gray-600 leading-relaxed">
                      I would like to receive product updates and marketing communications
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={isLoading || !formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.password_confirmation.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              After registration, you'll receive an OTP via email to verify your account.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
