import { request } from "./client"
import type { DailyReview, DailyViewData } from "../types/sadhana"

export async function getDailyView(date: string) {
  return request<DailyViewData>(`/daily-view?date=${date}`)
}

export async function updateDailyReview(
  ticketId: string,
  review: DailyReview,
) {
  const { review: savedReview } = await request<{ review: DailyReview }>(
    `/daily-tickets/${ticketId}/evaluation`,
    {
      method: "PATCH",
      body: JSON.stringify(review),
    },
  )
  return savedReview
}
