"use client"

import * as React from "react"
import { format } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { DateRange } from "react-day-picker"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ChartAreaInteractiveProps = {
  dateRange: DateRange | undefined
  goalName: string | undefined
}

// Temporary in-memory data. Later this will come from graph-based adjustment logic.
const chartData = [
  { date: "2026-08-01", desktop: 222, mobile: 150 },
  { date: "2026-08-02", desktop: 97, mobile: 180 },
  { date: "2026-08-03", desktop: 167, mobile: 120 },
  { date: "2026-08-04", desktop: 242, mobile: 260 },
  { date: "2026-08-05", desktop: 373, mobile: 290 },
  { date: "2026-08-06", desktop: 301, mobile: 340 },
  { date: "2026-08-07", desktop: 245, mobile: 180 },
  { date: "2026-08-08", desktop: 409, mobile: 320 },
  { date: "2026-08-09", desktop: 261, mobile: 190 },
  { date: "2026-08-10", desktop: 327, mobile: 350 },
  { date: "2026-08-11", desktop: 292, mobile: 210 },
  { date: "2026-08-12", desktop: 342, mobile: 380 },
  { date: "2026-08-13", desktop: 137, mobile: 220 },
  { date: "2026-08-14", desktop: 120, mobile: 170 },
  { date: "2026-08-15", desktop: 138, mobile: 190 },
  { date: "2026-08-16", desktop: 446, mobile: 360 },
  { date: "2026-08-17", desktop: 364, mobile: 410 },
  { date: "2026-08-18", desktop: 243, mobile: 180 },
  { date: "2026-08-19", desktop: 89, mobile: 150 },
  { date: "2026-08-20", desktop: 137, mobile: 200 },
  { date: "2026-08-21", desktop: 224, mobile: 170 },
  { date: "2026-08-22", desktop: 138, mobile: 230 },
  { date: "2026-08-23", desktop: 387, mobile: 290 },
  { date: "2026-08-24", desktop: 215, mobile: 250 },
  { date: "2026-08-25", desktop: 75, mobile: 130 },
  { date: "2026-08-26", desktop: 383, mobile: 420 },
  { date: "2026-08-27", desktop: 122, mobile: 180 },
  { date: "2026-08-28", desktop: 315, mobile: 240 },
  { date: "2026-08-29", desktop: 454, mobile: 380 },
  { date: "2026-08-30", desktop: 165, mobile: 220 },
  { date: "2026-08-31", desktop: 293, mobile: 310 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  dateRange,
  goalName,
}: ChartAreaInteractiveProps) {
  const filteredData = React.useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return chartData

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= dateRange.from! && date <= dateRange.to!
    })
  }, [dateRange])

  return (
    <Card className="pt-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Progress</CardTitle>
        <CardDescription>
          {goalName ? `Showing progress for ${goalName}` : "Select a goal to focus the chart"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => format(new Date(value), "MMM d")}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => format(new Date(value), "MMM d")}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
