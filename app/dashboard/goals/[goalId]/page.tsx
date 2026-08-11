import { WeeklyGoalDetail } from "../../_components/WeeklyGoalDetail"

type GoalPageProps = {
  params: Promise<{ goalId: string }>
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { goalId } = await params
  return <WeeklyGoalDetail goalId={goalId} />
}
