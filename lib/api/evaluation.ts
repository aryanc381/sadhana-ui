import { request } from "./client"
import type { Evaluation, EvaluationHistory, EvaluationReview } from "../types/sadhana"

export function getEvaluation(ticketId: string) {
  return request<{ evaluation: Evaluation }>(`/daily-tickets/${ticketId}/evaluation`)
}

export function startEvaluation(ticketId: string) {
  return request<{ evaluation: Evaluation }>(`/daily-tickets/${ticketId}/evaluation/start`, { method: "POST" })
}

export function getEvaluationHistory(ticketId: string) {
  return request<{ history: EvaluationHistory[] }>(`/daily-tickets/${ticketId}/evaluation/history`)
}

export function updateEvaluationReview(ticketId: string, review: EvaluationReview) {
  return request<{ review: EvaluationReview }>(`/daily-tickets/${ticketId}/evaluation`, { method: "PATCH", body: JSON.stringify(review) })
}

export function finishEvaluation(ticketId: string) {
  return request<{ evaluation: Evaluation }>(`/daily-tickets/${ticketId}/evaluation/finish`, { method: "POST" })
}

export function getCompletedEvaluations() {
  return request<{ evaluations: CompletedEvaluation[] }>("/evaluations/completed")
}

export function getEvaluationProgress(from: string, to: string) {
  return request<{ progress: EvaluationProgress[] }>(`/evaluations/progress?from=${from}&to=${to}`)
}

export type CompletedEvaluation = {
  ticket_id: string
  date: string
  evaluation: Evaluation
}

export type EvaluationProgress = {
  date: string
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
}
