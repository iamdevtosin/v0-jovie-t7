import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
import sharp from "sharp"

export async function uploadAndOptimizeImage(
  file: File,
  userId: string,
  options?: { width?: number; height?: number; quality?: number },
) {
  // Read the file as an ArrayBuffer
  const buffer = await file.arrayBuffer()

  // Process the image with sharp
  const processedImageBuffer = await sharp(buffer)
    .resize({
      width: options?.width,
      height: options?.height,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: options?.quality || 80 })
    .toBuffer()

  // Create a new File object from the processed buffer
  const optimizedFile = new File([processedImageBuffer], `${file.name.split(".")[0]}.webp`, { type: "image/webp" })

  // Generate a unique filename
  const uniqueId = nanoid()
  const filename = `${userId}/${uniqueId}-${optimizedFile.name}`

  // Upload original file
  const originalBlob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: false,
  })

  // Upload optimized file
  const optimizedBlob = await put(filename, optimizedFile, {
    access: "public",
    addRandomSuffix: false,
  })

  return {
    original: {
      url: originalBlob.url,
      size: file.size,
      mimeType: file.type,
    },
    optimized: {
      url: optimizedBlob.url,
      size: optimizedFile.size,
      mimeType: optimizedFile.type,
    },
    name: file.name,
  }
}
