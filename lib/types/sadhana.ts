export type Skill = {
  id: string
  name: string
  description: string
}

export type WeeklyGoal = {
  id: string
  week_number?: number
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: string
}

export type TaskStatus = "pending" | "completed" | "missed"

export type DailyTask = {
  id: string
  task_name: string
  task_description: string
  skill_id: string
  status: TaskStatus
}

export type DailyTicket = {
  id: string
  date: string
  status: string
  tasks: DailyTask[]
}

export type DailyReview = {
  mistakes: string | string[]
  improvements: string | string[]
}

export type DailyViewData = {
  date: string
  previous_day: DailyReview
  today: {
    ticket: DailyTicket
    review: DailyReview
  }
}

export type EvaluationMetric = {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  score: number
  verdict: "success" | "fail"
}

export type SkillEvaluationMetric = EvaluationMetric & { skillId: string }

export type Evaluation = {
  metrics: { overall: EvaluationMetric; skill: SkillEvaluationMetric[] }
  eval_loop: EvaluationReview[]
  status: boolean
}

export type EvaluationReview = { mistakes: string; improvements: string }
export type EvaluationHistory = { date: string; metrics: Evaluation["metrics"] | null }

export type CreateSkillInput = Pick<Skill, "name" | "description">

export type CreateWeeklyGoalInput = {
  name: string
  description?: string
  start_date: string
  end_date: string
}
