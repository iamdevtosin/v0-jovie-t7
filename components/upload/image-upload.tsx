"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface ImageUploadProps {
  onUploadComplete?: (media: any) => void
}

export function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    setIsUploading(true)
    setError(null)

    try {
      const file = fileInputRef.current.files[0]

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image")
      }

      // Call the callback with the uploaded media
      if (onUploadComplete) {
        onUploadComplete(result.media)
      }

      // Reset the form
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setPreview(null)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearPreview = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6">
          {preview ? (
            <div className="relative w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2"
                onClick={handleClearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 px-4 py-8 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or WebP (max 5MB)</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {preview && (
        <Button type="button" className="w-full" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Image"
          )}
        </Button>
      )}
    </div>
  )
}
