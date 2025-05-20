import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, User, Eye, Download, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Fetch user-specific documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch user-specific activities
  const { data: activityData } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch user credits
  const { data: userData } = await supabase.from("users").select("credits").eq("id", user.id).single()

  // Format the documents for display
  const recentDocuments = documents || []

  // Format activities for display or use default if none exist
  const activities =
    activityData?.map((activity) => ({
      icon: getActivityIcon(activity.type),
      title: activity.title,
      description: activity.description,
      time: formatTimeAgo(activity.created_at),
    })) || defaultActivities

  // Get document counts
  const { count: totalDocuments } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get view counts
  const { data: viewStats } = await supabase
    .from("document_stats")
    .select("SUM(views) as total_views")
    .eq("user_id", user.id)
    .single()

  // Get download counts
  const { data: downloadStats } = await supabase
    .from("document_stats")
    .select("SUM(downloads) as total_downloads")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Your created documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewStats?.total_views || 0}</div>
            <p className="text-xs text-muted-foreground">Total document views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloadStats?.total_downloads || 0}</div>
            <p className="text-xs text-muted-foreground">Total document downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.credits || 0}</div>
            <p className="text-xs text-muted-foreground">Remaining this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently created or edited documents</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                      {doc.type === "resume" ? (
                        <FileText className="h-6 w-6 text-primary" />
                      ) : doc.type === "cv" ? (
                        <FileText className="h-6 w-6 text-blue-500" />
                      ) : (
                        <User className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/preview/${doc.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/download/${doc.id}`}>
                          <Download className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/dashboard/create">Create your first document</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Your recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative mt-0.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <activity.icon className="h-4 w-4" />
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="absolute bottom-0 left-1/2 top-8 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper functions
function getActivityIcon(type: string) {
  switch (type) {
    case "create":
      return FileText
    case "download":
      return Download
    case "view":
      return Eye
    case "ai":
      return Sparkles
    default:
      return Clock
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Default activities for new users
const defaultActivities = [
  {
    icon: User,
    title: "Account created",
    description: "Welcome to Jovie! Your account has been created.",
    time: "just now",
  },
  {
    icon: Sparkles,
    title: "AI Credits added",
    description: "You received 20 AI credits to get started.",
    time: "just now",
  },
  {
    icon: FileText,
    title: "Ready to create",
    description: "Create your first resume, CV, or portfolio.",
    time: "just now",
  },
  {
    icon: Download,
    title: "Download anytime",
    description: "Download your documents as PDF when ready.",
    time: "just now",
  },
]
