import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <Link href="/" className="mb-8">
        <Image src="/images/logo.png" alt="Jovie" width={180} height={60} priority />
      </Link>
      <AuthForm type="login" />
    </div>
  )
}
