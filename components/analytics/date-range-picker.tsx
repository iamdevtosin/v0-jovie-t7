"use client"

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DateRangePicker() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current date range from URL or use defaults
  const now = new Date()
  const defaultEnd = now

  const periodParam = searchParams.get("period") || "30d"
  let defaultStart: Date

  switch (periodParam) {
    case "7d":
      defaultStart = addDays(now, -7)
      break
    case "30d":
      defaultStart = addDays(now, -30)
      break
    case "90d":
      defaultStart = addDays(now, -90)
      break
    case "1y":
      defaultStart = addDays(now, -365)
      break
    default:
      defaultStart = addDays(now, -30)
  }

  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startParam ? new Date(startParam) : defaultStart,
    to: endParam ? new Date(endParam) : defaultEnd,
  })

  const [period, setPeriod] = React.useState(periodParam)

  // Update URL when date range changes
  const updateUrlParams = (newDate: DateRange | undefined, newPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newPeriod !== "custom") {
      params.set("period", newPeriod)
      params.delete("start")
      params.delete("end")
    } else if (newDate?.from) {
      params.set("period", "custom")
      params.set("start", format(newDate.from, "yyyy-MM-dd"))
      if (newDate.to) {
        params.set("end", format(newDate.to, "yyyy-MM-dd"))
      } else {
        params.delete("end")
      }
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle period selection
  const handlePeriodChange = (value: string) => {
    setPeriod(value)

    let newStart: Date
    const newEnd = new Date()

    switch (value) {
      case "7d":
        newStart = addDays(newEnd, -7)
        break
      case "30d":
        newStart = addDays(newEnd, -30)
        break
      case "90d":
        newStart = addDays(newEnd, -90)
        break
      case "1y":
        newStart = addDays(newEnd, -365)
        break
      case "custom":
        return // Don't update dates for custom selection
      default:
        newStart = addDays(newEnd, -30)
    }

    const newDate = { from: newStart, to: newEnd }
    setDate(newDate)
    updateUrlParams(newDate, value)
  }

  // Handle date range selection
  const handleDateRangeChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    if (newDate?.from) {
      setPeriod("custom")
      updateUrlParams(newDate, "custom")
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
