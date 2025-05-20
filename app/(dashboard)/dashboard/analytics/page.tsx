import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, Share2, Clock } from "lucide-react"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string; period?: string }
}) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Default to last 30 days if no date range is specified
  const now = new Date()
  const defaultEnd = now.toISOString().split("T")[0]
  const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split("T")[0]

  const startDate = searchParams.start || defaultStart
  const endDate = searchParams.end || defaultEnd
  const period = searchParams.period || "30d"

  // Fetch document analytics
  const { data: documentStats } = await supabase
    .from("document_stats")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  // Fetch document details
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, type, created_at, view_count, download_count")
    .eq("user_id", user.id)
    .order("view_count", { ascending: false })
    .limit(10)

  // Fetch user activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false })
    .limit(20)

  // Prepare data for charts
  const viewsData = prepareTimeSeriesData(documentStats, "views")
  const downloadsData = prepareTimeSeriesData(documentStats, "downloads")
  const sharesData = prepareTimeSeriesData(documentStats, "shares")

  // Calculate totals
  const totalViews = documentStats?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0
  const totalDownloads = documentStats?.reduce((sum, stat) => sum + (stat.downloads || 0), 0) || 0
  const totalShares = documentStats?.reduce((sum, stat) => sum + (stat.shares || 0), 0) || 0

  // Calculate averages
  const daysInRange = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24))
  const avgViewsPerDay = totalViews / daysInRange
  const avgDownloadsPerDay = totalDownloads / daysInRange

  // Prepare document performance data
  const documentPerformance = documents?.map((doc) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    views: doc.view_count || 0,
    downloads: doc.download_count || 0,
    conversionRate: doc.view_count ? ((doc.download_count || 0) / doc.view_count) * 100 : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track the performance of your documents</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">{avgViewsPerDay.toFixed(1)} views per day on average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">
              {avgDownloadsPerDay.toFixed(1)} downloads per day on average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews ? ((totalDownloads / totalViews) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Downloads as percentage of views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares}</div>
            <p className="text-xs text-muted-foreground">
              {(totalShares / daysInRange).toFixed(1)} shares per day on average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <AnalyticsDashboard viewsData={viewsData} downloadsData={downloadsData} sharesData={sharesData} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Performance</CardTitle>
              <CardDescription>View the performance metrics of your top documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 p-3 text-sm font-medium">
                  <div className="col-span-2">Document</div>
                  <div className="text-center">Views</div>
                  <div className="text-center">Downloads</div>
                  <div className="text-center">Conversion</div>
                </div>
                <div className="divide-y">
                  {documentPerformance?.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-5 p-3 text-sm">
                      <div className="col-span-2 font-medium">{doc.name}</div>
                      <div className="text-center">{doc.views}</div>
                      <div className="text-center">{doc.downloads}</div>
                      <div className="text-center">{doc.conversionRate.toFixed(1)}%</div>
                    </div>
                  ))}
                  {(!documentPerformance || documentPerformance.length === 0) && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No document data available for the selected period
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Track your recent document activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {activities?.map((activity) => (
                  <div key={activity.id} className="flex">
                    <div className="relative mr-4 flex h-6 w-6 flex-none items-center justify-center">
                      <ActivityIcon type={activity.activity_type} />
                      <div className="absolute -bottom-6 top-8 left-1/2 w-px -translate-x-1/2 bg-border" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{formatActivityTitle(activity)}</p>
                      <p className="text-sm text-muted-foreground">{formatActivityDescription(activity)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <div className="text-center text-sm text-muted-foreground">
                    No activity data available for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function prepareTimeSeriesData(stats: any[] | null, metric: string) {
  if (!stats || stats.length === 0) return []

  return stats.map((stat) => ({
    date: stat.date,
    value: stat[metric] || 0,
  }))
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "document_created":
      return <div className="h-2 w-2 rounded-full bg-green-500" />
    case "document_viewed":
      return <div className="h-2 w-2 rounded-full bg-blue-500" />
    case "document_downloaded":
      return <div className="h-2 w-2 rounded-full bg-purple-500" />
    case "document_shared":
      return <div className="h-2 w-2 rounded-full bg-yellow-500" />
    default:
      return <div className="h-2 w-2 rounded-full bg-gray-500" />
  }
}

function formatActivityTitle(activity: any) {
  switch (activity.activity_type) {
    case "document_created":
      return `Created ${activity.metadata?.document_name || "a document"}`
    case "document_viewed":
      return `Viewed ${activity.metadata?.document_name || "a document"}`
    case "document_downloaded":
      return `Downloaded ${activity.metadata?.document_name || "a document"}`
    case "document_shared":
      return `Shared ${activity.metadata?.document_name || "a document"}`
    default:
      return "Activity recorded"
  }
}

function formatActivityDescription(activity: any) {
  switch (activity.activity_type) {
    case "document_created":
      return `Created a new ${activity.metadata?.document_type || "document"}`
    case "document_viewed":
      return `Document was viewed ${activity.metadata?.view_count || 1} times`
    case "document_downloaded":
      return `Document was downloaded as PDF`
    case "document_shared":
      return `Document was shared via ${activity.metadata?.share_method || "link"}`
    default:
      return ""
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
