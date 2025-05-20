"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsDashboardProps {
  viewsData: { date: string; value: number }[]
  downloadsData: { date: string; value: number }[]
  sharesData: { date: string; value: number }[]
}

export function AnalyticsDashboard({ viewsData, downloadsData, sharesData }: AnalyticsDashboardProps) {
  // Combine data for the overview chart
  const combinedData = viewsData.map((item, index) => ({
    date: item.date,
    views: item.value,
    downloads: downloadsData[index]?.value || 0,
    shares: sharesData[index]?.value || 0,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Document views, downloads, and shares over time</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              views: {
                label: "Views",
                color: "hsl(var(--chart-1))",
              },
              downloads: {
                label: "Downloads",
                color: "hsl(var(--chart-2))",
              },
              shares: {
                label: "Shares",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="aspect-[4/3]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  minTickGap={10}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-views)", opacity: 0.8 } }}
                  stroke="var(--color-views)"
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-downloads)", opacity: 0.8 } }}
                  stroke="var(--color-downloads)"
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-shares)", opacity: 0.8 } }}
                  stroke="var(--color-shares)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Views</CardTitle>
          <CardDescription>Document views over time</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              views: {
                label: "Views",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="aspect-[4/3]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  minTickGap={10}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="views"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-views)", opacity: 0.8 } }}
                  stroke="var(--color-views)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Downloads</CardTitle>
          <CardDescription>Document downloads over time</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              downloads: {
                label: "Downloads",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="aspect-[4/3]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadsData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  minTickGap={10}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="downloads"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-downloads)", opacity: 0.8 } }}
                  stroke="var(--color-downloads)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Shares</CardTitle>
          <CardDescription>Document shares over time</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              shares: {
                label: "Shares",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="aspect-[4/3]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sharesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  }
                  minTickGap={10}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="shares"
                  strokeWidth={2}
                  activeDot={{ r: 6, style: { fill: "var(--color-shares)", opacity: 0.8 } }}
                  stroke="var(--color-shares)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
