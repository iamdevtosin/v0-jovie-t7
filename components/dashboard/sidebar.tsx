"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Home,
  ImageIcon,
  LayoutTemplate,
  Settings,
  User,
  CreditCard,
  BarChart,
  Briefcase,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex-1 space-y-1">
          <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/resumes") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/resumes">
              <FileText className="mr-2 h-4 w-4" />
              Resumes
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/cvs") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/cvs">
              <FileText className="mr-2 h-4 w-4" />
              CVs
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/portfolios") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/portfolios">
              <User className="mr-2 h-4 w-4" />
              Portfolios
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/job-applications") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/job-applications">
              <Briefcase className="mr-2 h-4 w-4" />
              Job Applications
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/templates") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/templates">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/media") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/media">
              <ImageIcon className="mr-2 h-4 w-4" />
              Media
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/analytics") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/job-board") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/job-board">
              <Briefcase className="mr-2 h-4 w-4" />
              Job Board
            </Link>
          </Button>
          <Button
            variant={pathname.includes("/dashboard/billing") ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </Button>
        </div>
        <Button
          variant={pathname.includes("/dashboard/settings") ? "secondary" : "ghost"}
          className="w-full justify-start"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}
