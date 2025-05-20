import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobPostingsList } from "@/components/admin/job-board/job-postings-list"
import { JobCategoriesList } from "@/components/admin/job-board/job-categories-list"
import Link from "next/link"

export default function JobBoardManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Board Management</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/raven/job-board/categories/new">Add Category</Link>
          </Button>
          <Button asChild>
            <Link href="/raven/job-board/new">Post New Job</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="job-postings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="job-postings">Job Postings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="job-postings" className="space-y-4">
          <JobPostingsList />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <JobCategoriesList />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Board Analytics</CardTitle>
              <CardDescription>View statistics and performance metrics for your job board</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+3 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+28 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6.5</div>
                    <p className="text-xs text-muted-foreground">Per job posting</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
