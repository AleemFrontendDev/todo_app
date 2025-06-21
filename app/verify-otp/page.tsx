"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowRight, Building, Shield, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { verifyOtp, resendOtp } from "@/lib/api"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [canResend, setCanResend] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const storedEmail = localStorage.getItem('registration_email')
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    if (pastedData.length < 6) {
      inputRefs.current[pastedData.length]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a complete 6-digit OTP code.",
        variant: "destructive",
      })
      return
    }

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyOtp(email, otpCode)
      localStorage.removeItem('registration_email')
      
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully!",
      })

      router.push('/login')
      
    } catch (error: any) {
      console.error("❌ OTP verification failed:", error)
      
      let errorMessage = "Invalid OTP code. Please try again."
      
      if (error.message.includes("422")) {
        errorMessage = "Invalid OTP code or email address."
      } else if (error.message.includes("410")) {
        errorMessage = "OTP has expired. Please request a new one."
      } else if (error.message.includes("429")) {
        errorMessage = "Too many attempts. Please try again later."
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your connection."
      }

      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      console.log("🔄 Resending OTP to:", email)
      await resendOtp(email)     
      setTimeLeft(300)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email address.",
      })
      
    } catch (error: any) {
      console.error("❌ Failed to resend OTP:", error)
      
      let errorMessage = "Failed to resend OTP. Please try again."
      
      if (error.message.includes("429")) {
        errorMessage = "Too many requests. Please wait before requesting another OTP."
      } else if (error.message.includes("404")) {
        errorMessage = "Email address not found. Please check your email."
      }

      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                Secure Account Verification
              </h2>
              <p className="text-lg text-gray-600">
                We've sent a 6-digit verification code to your email address. Enter the code below to complete your account setup.
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">6-digit secure verification code</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Time-limited for enhanced security</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Encrypted email delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
              <CardDescription className="text-gray-600">
                Enter the 6-digit code sent to your email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Verification Code
                  </Label>
                  <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-12 text-center text-lg font-semibold bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-gray-600">
                      Code expires in: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      Your verification code has expired
                    </p>
                  )}
                  
                  {canResend && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOtp}
                      disabled={isResending}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
