import { redirect } from "next/navigation"

export function GET(request: Request) {
  // Extract email from query params if present
  const url = new URL(request.url)
  const email = url.searchParams.get("email")

  // Redirect to the verification page with email parameter if available
  if (email) {
    return redirect(`/verify?email=${encodeURIComponent(email)}`)
  }

  // Otherwise just redirect to the verification page
  return redirect("/verify")
}
