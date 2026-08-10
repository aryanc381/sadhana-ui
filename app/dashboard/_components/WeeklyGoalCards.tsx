import { format } from "date-fns"

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

export function WeeklyGoalCards({ goals }: WeeklyGoalCardsProps) {
  if (!goals.length) return null

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-medium">Weekly goals</h2>
      <div className="flex gap-4 overflow-x-auto px-px pt-px pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {goals.map((goal, index) => (
          <Card
            key={goal.id}
            className="h-32 min-w-72 shrink-0"
          >
            <CardHeader className="p-3 pb-1">
              <CardDescription>
                Week {goal.week_number ?? index + 1}
              </CardDescription>
              <CardAction>
                <Badge variant="outline">{goal.status}</Badge>
              </CardAction>
              <CardTitle>{goal.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                <span className="whitespace-nowrap">
                  {format(new Date(goal.start_date), "MMM dd, yyyy")}
                </span>
                <span className="whitespace-nowrap">
                  {format(new Date(goal.end_date), "MMM dd, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
