"use client"

import { useEffect, useRef } from "react"
import type { Editor as TinyMCEEditor } from "tinymce"

interface EditorProps {
  value: string
  onChange: (content: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null)

  useEffect(() => {
    const initEditor = async () => {
      const tinymce = (await import("tinymce")).default
      const initOptions = {
        selector: "#tiny-editor",
        height: 500,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        setup: (editor: TinyMCEEditor) => {
          editorRef.current = editor
          editor.on("change", () => {
            onChange(editor.getContent())
          })
          editor.on("init", () => {
            editor.setContent(value)
          })
        },
      }

      if (tinymce) {
        tinymce.init(initOptions)
      }
    }

    initEditor()

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
      }
    }
  }, [])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value)
    }
  }, [value])

  return (
    <div>
      <textarea id="tiny-editor" style={{ visibility: "hidden" }} />
    </div>
  )
}
