import { request } from "./client"
import type {
  CreateWeeklyGoalInput,
  WeeklyGoal,
} from "../types/sadhana"

type BackendGoal = Omit<WeeklyGoal, "id"> & { _id: string }

function normalizeGoal(goal: BackendGoal): WeeklyGoal {
  return {
    id: goal._id,
    week_number: goal.week_number,
    name: goal.name,
    description: goal.description,
    start_date: goal.start_date,
    end_date: goal.end_date,
    status: goal.status,
  }
}

export async function getWeeklyGoals() {
  const { goals } = await request<{ goals: WeeklyGoal[] }>("/weekly-goals")
  return goals
}

export async function createWeeklyGoal(input: CreateWeeklyGoalInput) {
  const { weekly_goal } = await request<{ weekly_goal: BackendGoal }>(
    "/weekly-goals",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  )

  return normalizeGoal(weekly_goal)
}

export async function assignSkillToGoal(
  weeklyGoalId: string,
  skillId: string,
) {
  const { weekly_goal } = await request<{ weekly_goal: BackendGoal }>(
    `/weekly-goals/${weeklyGoalId}/skills`,
    {
      method: "PATCH",
      body: JSON.stringify({ skill_id: skillId }),
    },
  )

  return normalizeGoal(weekly_goal)
}
