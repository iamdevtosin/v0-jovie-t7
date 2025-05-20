"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"

const skillSchema = z.object({
  name: z.string().min(1, { message: "Skill name is required." }),
  level: z.string().optional(),
  category: z.string().optional(),
})

interface SkillsFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [skills, setSkills] = useState(data || [])

  const form = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      level: "intermediate",
      category: "",
    },
  })

  const deleteSkill = (index: number) => {
    const updatedSkills = [...skills]
    updatedSkills.splice(index, 1)
    setSkills(updatedSkills)
    onChange(updatedSkills)
  }

  function onSubmit(values: z.infer<typeof skillSchema>) {
    const updatedSkills = [...skills, values]
    setSkills(updatedSkills)
    onChange(updatedSkills)
    form.reset({
      name: "",
      level: "intermediate",
      category: "",
    })
  }

  // Group skills by category
  const groupedSkills: Record<string, any[]> = {}
  skills.forEach((skill) => {
    const category = skill.category || "Other"
    if (!groupedSkills[category]) {
      groupedSkills[category] = []
    }
    groupedSkills[category].push(skill)
  })

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript, Photoshop, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Programming, Design, etc." {...field} />
                  </FormControl>
                  <FormDescription>Group similar skills together</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </form>
      </Form>

      {skills.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-muted/50">
          <p className="text-muted-foreground">No skills added yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Add your skills using the form above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardContent className="pt-6">
                <h4 className="text-sm font-semibold mb-3">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill, index) => {
                    const skillIndex = skills.findIndex(
                      (s) => s.name === skill.name && s.level === skill.level && s.category === skill.category,
                    )

                    return (
                      <Badge key={index} variant="outline" className="flex items-center gap-1 px-3 py-1">
                        {skill.name}
                        {skill.level && <span className="text-xs text-muted-foreground">({skill.level})</span>}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteSkill(skillIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
