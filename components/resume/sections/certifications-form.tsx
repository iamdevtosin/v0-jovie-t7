"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  url: string
}

interface CertificationsFormProps {
  data: Certification[]
  onChange: (data: Certification[]) => void
}

export function CertificationsForm({ data, onChange }: CertificationsFormProps) {
  const [certifications, setCertifications] = useState<Certification[]>(data || [])

  const handleChange = (index: number, field: keyof Certification, value: any) => {
    const updatedCertifications = [...certifications]
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    }
    setCertifications(updatedCertifications)
    onChange(updatedCertifications)
  }

  const handleAdd = () => {
    const newCertification: Certification = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      url: "",
    }
    const updatedCertifications = [...certifications, newCertification]
    setCertifications(updatedCertifications)
    onChange(updatedCertifications)
  }

  const handleRemove = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index)
    setCertifications(updatedCertifications)
    onChange(updatedCertifications)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(certifications)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCertifications(items)
    onChange(items)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <CardDescription>Add your professional certifications and licenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="certifications">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {certifications.map((certification, index) => (
                  <Draggable key={certification.id} draggableId={certification.id} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="flex items-center justify-between space-x-4"
                      >
                        <div className="flex-1 space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={certification.name}
                            onChange={(e) => handleChange(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Issuer</Label>
                          <Input
                            value={certification.issuer}
                            onChange={(e) => handleChange(index, "issuer", e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Date</Label>
                          <Input
                            value={certification.date}
                            onChange={(e) => handleChange(index, "date", e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={certification.url}
                            onChange={(e) => handleChange(index, "url", e.target.value)}
                          />
                        </div>
                        <Button variant="ghost" onClick={() => handleRemove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </CardFooter>
    </Card>
  )
}
