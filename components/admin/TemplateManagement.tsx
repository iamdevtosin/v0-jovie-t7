"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { FileText, Briefcase, User, Plus, Trash2, Edit, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function TemplateManagement() {
  const [activeTab, setActiveTab] = useState("resume")
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Fetch templates on component mount
  const fetchTemplates = async (category: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchTemplates(value)
  }

  // Toggle template active status
  const toggleTemplateStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("templates").update({ is_active: !isActive }).eq("id", id)

      if (error) throw error

      // Update local state
      setTemplates(templates.map((template) => (template.id === id ? { ...template, is_active: !isActive } : template)))
    } catch (error) {
      console.error("Error updating template status:", error)
    }
  }

  // Delete template
  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const { error } = await supabase.from("templates").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setTemplates(templates.filter((template) => template.id !== id))
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <Button onClick={() => router.push("/raven/templates/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Template
        </Button>
      </div>

      <Tabs defaultValue="resume" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumes
          </TabsTrigger>
          <TabsTrigger value="cv" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            CVs
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Portfolios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading templates...</p>
            ) : templates.length === 0 ? (
              <p>No resume templates found.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-${template.id}`}>Active</Label>
                        <Switch
                          id={`active-${template.id}`}
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateStatus(template.id, template.is_active)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}/preview`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cv" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading templates...</p>
            ) : templates.length === 0 ? (
              <p>No CV templates found.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-${template.id}`}>Active</Label>
                        <Switch
                          id={`active-${template.id}`}
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateStatus(template.id, template.is_active)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}/preview`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>Loading templates...</p>
            ) : templates.length === 0 ? (
              <p>No portfolio templates found.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`active-${template.id}`}>Active</Label>
                        <Switch
                          id={`active-${template.id}`}
                          checked={template.is_active}
                          onCheckedChange={() => toggleTemplateStatus(template.id, template.is_active)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/raven/templates/${template.id}/preview`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
