"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, Sparkles, Briefcase, Mail } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/raven",
      active: pathname === "/raven",
    },
    {
      label: "Users",
      icon: Users,
      href: "/raven/users",
      active: pathname === "/raven/users",
    },
    {
      label: "Templates",
      icon: FileText,
      href: "/raven/templates",
      active: pathname === "/raven/templates" || pathname.startsWith("/raven/templates/"),
    },
    {
      label: "AI Settings",
      icon: Sparkles,
      href: "/raven/ai",
      active: pathname === "/raven/ai",
    },
    {
      label: "Job Board",
      icon: Briefcase,
      href: "/raven/job-board",
      active: pathname === "/raven/job-board" || pathname.startsWith("/raven/job-board/"),
    },
    {
      label: "Job Applications",
      icon: FileText,
      href: "/raven/job-applications",
      active: pathname === "/raven/job-applications",
    },
    {
      label: "Newsletters",
      icon: Mail,
      href: "/raven/newsletters",
      active: pathname === "/raven/newsletters",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/raven/settings",
      active: pathname === "/raven/settings",
    },
  ]

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Dashboard</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
