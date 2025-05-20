"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function VerifyPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Get email from URL params or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get("email")
    const storedEmail = localStorage.getItem("verificationEmail")

    if (emailParam) {
      setEmail(emailParam)
      localStorage.setItem("verificationEmail", emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) throw error

      setSuccess("Verification email has been resent. Please check your inbox.")
      setCountdown(60) // Set 60 second cooldown
      localStorage.setItem("verificationEmail", email)
    } catch (error: any) {
      setError(error.message || "Failed to resend verification email")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!email || !otp) {
      setError("Please enter both email and OTP code")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      })

      if (error) throw error

      setSuccess("Email verified successfully! Redirecting to dashboard...")
      localStorage.removeItem("verificationEmail")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <Link href="/" className="mb-8">
        <Image src="/images/logo.png" alt="Jovie" width={180} height={60} priority />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent you a verification link and code. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Email Link</TabsTrigger>
              <TabsTrigger value="otp">OTP Code</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="space-y-4 pt-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-primary/10 p-6">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert
                    variant="default"
                    className="border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="w-full space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleResendEmail} disabled={loading || countdown > 0}>
                    {loading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Verification Email"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="otp" className="space-y-4 pt-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-center text-sm">Enter the verification code sent to your email address.</p>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert
                    variant="default"
                    className="border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="w-full space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Enter OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  {/* Request new OTP button */}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleResendEmail}
                    disabled={loading || countdown > 0}
                  >
                    {loading ? "Sending..." : countdown > 0 ? `Request new code in ${countdown}s` : "Request new code"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Return to login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
