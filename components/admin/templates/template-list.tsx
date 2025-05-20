"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/lib/supabase/database.types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Search, FileText, Briefcase, User } from "lucide-react"
import Image from "next/image"

type Template = Database["public"]["Tables"]["templates"]["Row"]

interface TemplateListProps {
  templates: Template[]
}

export function TemplateList({ templates: initialTemplates }: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const router = useRouter()
  const supabase = createClient()

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleToggleActive = async (template: Template) => {
    try {
      const { error } = await supabase
        .from("templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id)

      if (error) throw error

      // Update local state
      setTemplates(templates.map((t) => (t.id === template.id ? { ...t, is_active: !t.is_active } : t)))
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "resume":
        return <FileText className="h-4 w-4" />
      case "cv":
        return <Briefcase className="h-4 w-4" />
      case "portfolio":
        return <User className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="resume">Resumes</SelectItem>
            <SelectItem value="cv">CVs</SelectItem>
            <SelectItem value="portfolio">Portfolios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              No templates match your search criteria. Try adjusting your filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                <Image
                  src={template.thumbnail_url || "/images/placeholder.svg?height=300&width=225"}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={template.is_premium ? "default" : "outline"}>
                      {template.is_premium ? "Premium" : "Free"}
                    </Badge>
                    <Badge
                      variant={template.is_active ? "success" : "destructive"}
                      className={template.is_active ? "bg-green-500" : ""}
                    >
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/raven/templates/${template.id}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/raven/templates/${template.id}/preview`)}>
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                        {template.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/raven/templates/${template.id}`)}
                >
                  Edit Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
