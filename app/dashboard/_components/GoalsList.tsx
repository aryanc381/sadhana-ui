import type { WeeklyGoal } from "@/lib/types/sadhana"

type GoalsListProps = {
  goals: WeeklyGoal[]
  isLoading: boolean
}

export function GoalsList({ goals, isLoading }: GoalsListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading goals...</p>
  }

  if (!goals.length) {
    return null
  }

  return (
    <div className="grid gap-3">
      {goals.map((goal) => (
        <article key={goal.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-medium">{goal.name}</h2>
            <span className="text-sm text-muted-foreground">{goal.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {goal.start_date.slice(0, 10)} - {goal.end_date.slice(0, 10)}
          </p>
        </article>
      ))}
    </div>
  )
}
