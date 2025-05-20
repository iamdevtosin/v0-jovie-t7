"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, Menu } from "lucide-react"

interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/images/jovielogodark.png"
              alt="Jovie Logo"
              width={120}
              height={40}
              className="hidden dark:block"
            />
            <Image src="/images/logo.png" alt="Jovie Logo" width={120} height={40} className="block dark:hidden" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <span className="hidden md:inline-block">My Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
