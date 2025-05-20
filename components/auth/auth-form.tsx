"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface AuthFormProps {
  type: "login" | "signup"
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (type === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error

        // Get default signup credits
        const { data: creditSettings } = await supabase
          .from("default_credits")
          .select("signup_credits")
          .limit(1)
          .single()

        const signupCredits = creditSettings?.signup_credits || 10

        // Create user profile in the database
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            role: "user",
            credits: signupCredits,
          })

          // Initialize user_credits record
          await supabase.from("user_credits").insert({
            user_id: user.id,
            available_credits: signupCredits,
            total_credits_earned: signupCredits,
            total_credits_used: 0,
            last_refresh_date: new Date().toISOString(),
          })

          // Record credit transaction
          await supabase.from("credit_transactions").insert({
            user_id: user.id,
            amount: signupCredits,
            transaction_type: "signup_bonus",
            description: "Welcome bonus credits",
          })

          // Log activity for credits
          await supabase.from("activities").insert({
            user_id: user.id,
            activity_type: "credits",
            title: "Welcome credits added",
            description: `You received ${signupCredits} AI credits to get started.`,
          })

          // Create notification
          await supabase.from("credit_notifications").insert({
            user_id: user.id,
            notification_type: "credits_added",
            message: `Welcome to Jovie! You've received ${signupCredits} credits to get started.`,
          })
        }

        // Redirect to verification page
        router.push("/auth/verify")
      } else {
        // Set session expiration based on remember me option
        const expiresIn = rememberMe ? 60 * 60 * 24 : 60 * 60 * 3 // 24 hours or 3 hours

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            expiresIn,
          },
        })
        if (error) throw error
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {type === "login" ? "Sign in to your account" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {type === "login" ? "Enter your email and password to sign in" : "Enter your details to create an account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>

          {type === "login" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me for 24 hours
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? type === "login"
                ? "Signing in..."
                : "Creating account..."
              : type === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          {type === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/signup")}>
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/login")}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
