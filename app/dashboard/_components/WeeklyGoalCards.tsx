import { format } from "date-fns"

import type { WeeklyGoal } from "@/lib/types/sadhana"
import {
  Card,
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
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {goals.map((goal) => (
          <Card key={goal.id} className="relative min-w-72 shrink-0">
            <CardHeader>
              <CardDescription>Week {goal.week_number}</CardDescription>
              <span className="absolute top-6 right-6 text-sm text-muted-foreground">
                {goal.status}
              </span>
              <CardTitle>{goal.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                <p>{format(new Date(goal.start_date), "MMM dd, yyyy")}</p>
                <p>{format(new Date(goal.end_date), "MMM dd, yyyy")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
