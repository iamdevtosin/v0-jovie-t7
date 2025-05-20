"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"

interface CollaborativePresenceProps {
  collaborators: any[]
}

export function CollaborativePresence({ collaborators }: CollaborativePresenceProps) {
  // Limit to 3 visible avatars
  const visibleCollaborators = collaborators.slice(0, 3)
  const remainingCount = collaborators.length - 3

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 mr-2">
        <TooltipProvider>
          {visibleCollaborators.map((collaborator, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-2 border-background">
                  {collaborator.user_name?.[0] || "U"}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collaborator.user_name || "Unknown user"}</p>
                <p className="text-xs text-muted-foreground">
                  Active {formatDistanceToNow(new Date(collaborator.online_at), { addSuffix: true })}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-background">
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {remainingCount} more {remainingCount === 1 ? "collaborator" : "collaborators"}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
      <span className="text-sm text-muted-foreground">
        {collaborators.length} {collaborators.length === 1 ? "person" : "people"} editing
      </span>
    </div>
  )
}
