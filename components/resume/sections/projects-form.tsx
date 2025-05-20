"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"

const projectItemSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }),
  role: z.string().optional(),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  technologies: z.string().optional(),
})

interface ProjectsFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const [projects, setProjects] = useState(data || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const form = useForm<z.infer<typeof projectItemSchema>>({
    resolver: zodResolver(projectItemSchema),
    defaultValues: {
      name: "",
      role: "",
      url: "",
      startDate: "",
      endDate: "",
      description: "",
      technologies: "",
    },
  })

  const resetForm = () => {
    form.reset({
      name: "",
      role: "",
      url: "",
      startDate: "",
      endDate: "",
      description: "",
      technologies: "",
    })
  }

  const editProject = (index: number) => {
    const project = projects[index]
    form.reset({
      name: project.name,
      role: project.role || "",
      url: project.url || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      description: project.description || "",
      technologies: project.technologies || "",
    })
    setEditIndex(index)
    setIsDialogOpen(true)
  }

  const deleteProject = (index: number) => {
    const updatedProjects = [...projects]
    updatedProjects.splice(index, 1)
    setProjects(updatedProjects)
    onChange(updatedProjects)
  }

  function onSubmit(values: z.infer<typeof projectItemSchema>) {
    const updatedProjects = [...projects]

    if (editIndex !== null) {
      updatedProjects[editIndex] = values
    } else {
      updatedProjects.push(values)
    }

    setProjects(updatedProjects)
    onChange(updatedProjects)
    setIsDialogOpen(false)
    setEditIndex(null)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm()
                setEditIndex(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Lead Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://myproject.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project and your contributions..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies Used</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, TypeScript" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">{editIndex !== null ? "Update Project" : "Add Project"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <Card key={index}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">
                    {project.name}
                    {project.role && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">({project.role})</span>
                    )}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => editProject(index)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProject(index)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm">
                {(project.startDate || project.endDate) && (
                  <p className="text-muted-foreground">
                    {project.startDate && <span>{new Date(project.startDate).toLocaleDateString()}</span>}
                    {project.startDate && project.endDate && <span> - </span>}
                    {project.endDate && <span>{new Date(project.endDate).toLocaleDateString()}</span>}
                  </p>
                )}
                {project.description && <p className="mt-1">{project.description}</p>}
                {project.technologies && (
                  <p className="mt-1 text-muted-foreground">
                    <span className="font-medium">Technologies:</span> {project.technologies}
                  </p>
                )}
                {project.url && (
                  <p className="mt-1">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Project
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No projects added yet. Click "Add Project" to get started.</p>
        </div>
      )}
    </div>
  )
}
