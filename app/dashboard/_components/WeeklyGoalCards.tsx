import { format } from "date-fns"
import Link from "next/link"

import type { WeeklyGoal } from "@/lib/types/sadhana"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type WeeklyGoalCardsProps = {
  goals: WeeklyGoal[]
}

const statusColors: Record<string, string> = {
  success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  pending: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  failure: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  ongoing: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
}

export function WeeklyGoalCards({ goals }: WeeklyGoalCardsProps) {
  if (!goals.length) return null

  return (
    <section className="mt-8 w-full min-w-0 max-w-full">
      <h2 className="mb-4 text-lg font-medium">Weekly goals</h2>
      <div className="flex w-full min-w-0 max-w-full flex-nowrap gap-4 overflow-x-auto overflow-y-hidden px-px pt-px pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {goals.map((goal, index) => (
          <Link
            key={goal.id}
            href={`/dashboard/goals/${goal.id}`}
            className="block w-80 max-w-[calc(100vw-3rem)] shrink-0"
          >
            <Card className="min-h-40 w-full cursor-pointer gap-0 py-0 transition-colors hover:bg-muted/50">
              <CardHeader className="p-3 pb-1">
                <CardDescription>
                  Week {goal.week_number ?? index + 1}
                </CardDescription>
                <CardAction>
                  <Badge
                    className={`${statusColors[goal.status] ?? "bg-muted text-muted-foreground"} px-[0.5vw] py-[0.35vw]`}
                  >
                    {goal.status}
                  </Badge>
                </CardAction>
                <CardTitle className="min-w-0 break-words pr-2">{goal.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    {format(new Date(goal.start_date), "MMM dd, yyyy")}
                  </span>
                  <span>
                    {format(new Date(goal.end_date), "MMM dd, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
