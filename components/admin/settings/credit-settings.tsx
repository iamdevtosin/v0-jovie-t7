"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CreditSettingsProps {
  initialSettings: {
    id: string
    signup_credits: number
    monthly_free_credits: number
    pro_tier_credits: number
    enterprise_tier_credits: number
  }
}

export function CreditSettings({ initialSettings }: CreditSettingsProps) {
  const [settings, setSettings] = useState({
    signup_credits: initialSettings?.signup_credits || 10,
    monthly_free_credits: initialSettings?.monthly_free_credits || 5,
    pro_tier_credits: initialSettings?.pro_tier_credits || 50,
    enterprise_tier_credits: initialSettings?.enterprise_tier_credits || 200,
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: Number.parseInt(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const { error } = await supabase
        .from("default_credits")
        .update({
          signup_credits: settings.signup_credits,
          monthly_free_credits: settings.monthly_free_credits,
          pro_tier_credits: settings.pro_tier_credits,
          enterprise_tier_credits: settings.enterprise_tier_credits,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("id", initialSettings.id)

      if (error) throw error

      toast({
        title: "Settings updated",
        description: "Credit settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating credit settings:", error)
      toast({
        title: "Error updating settings",
        description: "There was an error updating the credit settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Default Credit Allocations</CardTitle>
          <CardDescription>Configure the number of credits users receive in different scenarios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signup_credits">New User Signup Credits</Label>
              <Input
                id="signup_credits"
                name="signup_credits"
                type="number"
                min="0"
                value={settings.signup_credits}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Credits given to new users upon registration</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_free_credits">Monthly Free Credits</Label>
              <Input
                id="monthly_free_credits"
                name="monthly_free_credits"
                type="number"
                min="0"
                value={settings.monthly_free_credits}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Credits given to free tier users each month</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pro_tier_credits">Pro Tier Monthly Credits</Label>
              <Input
                id="pro_tier_credits"
                name="pro_tier_credits"
                type="number"
                min="0"
                value={settings.pro_tier_credits}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Credits given to pro tier users each month</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enterprise_tier_credits">Enterprise Tier Monthly Credits</Label>
              <Input
                id="enterprise_tier_credits"
                name="enterprise_tier_credits"
                type="number"
                min="0"
                value={settings.enterprise_tier_credits}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Credits given to enterprise tier users each month</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
