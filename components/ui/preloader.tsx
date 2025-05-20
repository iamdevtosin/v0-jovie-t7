import { Loader2 } from "lucide-react"

interface PreloaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Preloader({ size = "md", text, fullScreen = false }: PreloaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
          {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  )
}
