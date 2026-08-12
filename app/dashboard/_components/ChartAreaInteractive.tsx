"use client"

import * as React from "react"
import { addDays, format, startOfDay } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { DateRange } from "react-day-picker"
import { getEvaluationProgress, type EvaluationProgress } from "@/lib/api/evaluation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  total_tasks: { label: "Total tasks", color: "#64748b" },
  completed_tasks: { label: "Completed", color: "#16a34a" },
  pending_tasks: { label: "Pending", color: "#d97706" },
} satisfies ChartConfig

export function ChartAreaInteractive({ dateRange, goalName }: { dateRange?: DateRange; goalName: string | undefined }) {
  const [today] = React.useState(() => startOfDay(new Date()))
  const [progress, setProgress] = React.useState<EvaluationProgress[]>([])
  const from = dateRange?.from && dateRange.to ? startOfDay(dateRange.from) : addDays(today, -3)
  const to = dateRange?.from && dateRange.to ? startOfDay(dateRange.to) : addDays(today, 3)
  const fromKey = format(from, "yyyy-MM-dd")
  const toKey = format(to, "yyyy-MM-dd")

  React.useEffect(() => {
    getEvaluationProgress(fromKey, toKey)
      .then((result) => setProgress(result.progress))
      .catch(() => setProgress([]))
  }, [fromKey, toKey])

  const data = React.useMemo(() => {
    const byDate = new Map(progress.map((item) => [format(new Date(item.date), "yyyy-MM-dd"), item]))
    const days: EvaluationProgress[] = []
    for (let date = startOfDay(from); date <= to; date = addDays(date, 1)) {
      const key = format(date, "yyyy-MM-dd")
      days.push(byDate.get(key) ?? { date: key, total_tasks: 0, completed_tasks: 0, pending_tasks: 0 })
    }
    return days
  }, [from, progress, to])

  return (
    <Card className="pt-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Progress</CardTitle>
        <CardDescription>{goalName ? `Showing progress for ${goalName}` : "Daily task progress"}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-total_tasks)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-total_tasks)" stopOpacity={0.03} /></linearGradient>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-completed_tasks)" stopOpacity={0.75} /><stop offset="95%" stopColor="var(--color-completed_tasks)" stopOpacity={0.08} /></linearGradient>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-pending_tasks)" stopOpacity={0.55} /><stop offset="95%" stopColor="var(--color-pending_tasks)" stopOpacity={0.06} /></linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(new Date(value), "MMM d")} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(value) => format(new Date(value), "MMM d")} indicator="dot" />} />
            <Area dataKey="total_tasks" type="monotone" stroke="var(--color-total_tasks)" fill="url(#fillTotal)" strokeWidth={2} />
            <Area dataKey="completed_tasks" type="monotone" stroke="var(--color-completed_tasks)" fill="url(#fillCompleted)" strokeWidth={2} />
            <Area dataKey="pending_tasks" type="monotone" stroke="var(--color-pending_tasks)" fill="url(#fillPending)" strokeWidth={2} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
