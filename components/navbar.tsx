"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/jovielogodark.png"
              alt="Jovie Logo"
              width={120}
              height={40}
              className="hidden dark:block"
            />
            <Image src="/images/logo.png" alt="Jovie Logo" width={120} height={40} className="block dark:hidden" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="transition-colors hover:text-jovie-primary">
              Features
            </Link>
            <Link href="#templates" className="transition-colors hover:text-jovie-primary">
              Templates
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-jovie-primary">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:text-jovie-primary hover:bg-jovie-light">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-jovie-primary hover:bg-jovie-dark text-white">
                Sign up
              </Button>
            </Link>
          </div>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col gap-4">
            <Link
              href="#features"
              className="text-foreground/70 hover:text-jovie-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#templates"
              className="text-foreground/70 hover:text-jovie-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Templates
            </Link>
            <Link
              href="#pricing"
              className="text-foreground/70 hover:text-jovie-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full hover:bg-jovie-light hover:text-jovie-primary">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-jovie-primary hover:bg-jovie-dark">Sign up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
