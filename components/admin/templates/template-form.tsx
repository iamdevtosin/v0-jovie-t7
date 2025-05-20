"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/upload/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Template = Database["public"]["Tables"]["templates"]["Row"]

interface TemplateFormProps {
  template?: Template
}

export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    category: template?.category || "resume",
    thumbnail_url: template?.thumbnail_url || "",
    html_structure: template?.html_structure || '<div class="template"><!-- Template structure here --></div>',
    css_styles: template?.css_styles || "/* Template styles here */",
    is_premium: template?.is_premium || false,
    is_active: template?.is_active !== undefined ? template.is_active : true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (media: any) => {
    setFormData((prev) => ({ ...prev, thumbnail_url: media.optimized_url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.thumbnail_url) {
        throw new Error("Please upload a thumbnail image")
      }

      if (template) {
        // Update existing template
        const { error } = await supabase
          .from("templates")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category as "resume" | "cv" | "portfolio",
            thumbnail_url: formData.thumbnail_url,
            html_structure: formData.html_structure,
            css_styles: formData.css_styles,
            is_premium: formData.is_premium,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", template.id)

        if (error) throw error
      } else {
        // Create new template
        const { error } = await supabase.from("templates").insert({
          name: formData.name,
          description: formData.description,
          category: formData.category as "resume" | "cv" | "portfolio",
          thumbnail_url: formData.thumbnail_url,
          html_structure: formData.html_structure,
          css_styles: formData.css_styles,
          is_premium: formData.is_premium,
          is_active: formData.is_active,
        })

        if (error) throw error
      }

      router.push("/raven/templates")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving template:", error)
      setError(error.message || "Failed to save template")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resume">Resume</SelectItem>
                <SelectItem value="cv">CV</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_premium"
              checked={formData.is_premium}
              onCheckedChange={(checked) => handleSwitchChange("is_premium", checked)}
            />
            <Label htmlFor="is_premium">Premium Template</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Thumbnail Image</Label>
          {formData.thumbnail_url ? (
            <div className="relative aspect-[3/4] overflow-hidden rounded-md border">
              <img
                src={formData.thumbnail_url || "/placeholder.svg"}
                alt="Template thumbnail"
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
              >
                Remove
              </Button>
            </div>
          ) : (
            <ImageUpload onUploadComplete={handleImageUpload} />
          )}
        </div>
      </div>

      <Tabs defaultValue="html" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="html">HTML Structure</TabsTrigger>
          <TabsTrigger value="css">CSS Styles</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                name="html_structure"
                value={formData.html_structure}
                onChange={handleChange}
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="css">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                name="css_styles"
                value={formData.css_styles}
                onChange={handleChange}
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/raven/templates")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {template ? "Updating..." : "Creating..."}
            </>
          ) : template ? (
            "Update Template"
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </form>
  )
}
