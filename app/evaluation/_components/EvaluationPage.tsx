"use client"

import * as React from "react"
import { format } from "date-fns"
import Link from "next/link"
import { AppSidebar } from "@/app/dashboard/_components/AppSidebar"
import { getDailyView } from "@/lib/api/daily-view"
import { finishEvaluation, getEvaluationHistory, startEvaluation, updateEvaluationReview } from "@/lib/api/evaluation"
import type { DailyViewData, Evaluation, EvaluationHistory } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { EvaluationCharts } from "./EvaluationCharts"

export function EvaluationPage() {
  const date = format(new Date(), "yyyy-MM-dd")
  const [view, setView] = React.useState<DailyViewData>()
  const [evaluation, setEvaluation] = React.useState<Evaluation>()
  const [history, setHistory] = React.useState<EvaluationHistory[]>([])
  const [step, setStep] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getDailyView(date).then(setView).catch(showError).finally(() => setLoading(false))
  }, [date])

  async function begin() {
    if (!view) return
    try {
      const [started, past] = await Promise.all([startEvaluation(view.today.ticket.id), getEvaluationHistory(view.today.ticket.id)])
      setEvaluation(started.evaluation); setHistory(past.history); setStep(1)
    } catch (error) { showError(error) }
  }

  async function finish() {
    if (!view) return
    try { const result = await finishEvaluation(view.today.ticket.id); setEvaluation(result.evaluation); setStep(4); toast.add({ title: "Evaluation finished", type: "success" }) } catch (error) { showError(error) }
  }

  if (loading) return <EvaluationShell><Skeleton className="h-full w-full" /></EvaluationShell>
  if (!view) return <EvaluationShell><p className="text-sm text-muted-foreground">No daily ticket available.</p></EvaluationShell>
  if (!evaluation) return <EvaluationShell><Card className="mx-auto mt-12 max-w-2xl"><CardHeader><CardTitle>Good evening</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-muted-foreground">Let’s look back at {format(new Date(date), "MMMM d, yyyy")}.</p><Button onClick={begin} className="cursor-pointer">Start evaluation</Button></CardContent></Card></EvaluationShell>

  return <EvaluationShell>{step === 1 && <OverallStep evaluation={evaluation} history={history} onNext={() => setStep(2)} />}{step === 2 && <SkillStep evaluation={evaluation} history={history} onBack={() => setStep(1)} onNext={() => setStep(3)} />}{step === 3 && <ReviewStep ticketId={view.today.ticket.id} evaluation={evaluation} onBack={() => setStep(2)} onNext={() => setStep(4)} />}{step === 4 && <FinishStep evaluation={evaluation} onFinish={finish} onBack={() => setStep(3)} />}</EvaluationShell>
}

function EvaluationShell({ children }: { children: React.ReactNode }) {
  return <SidebarProvider><AppSidebar /><SidebarInset className="min-w-0 overflow-hidden"><header className="flex h-16 shrink-0 items-center border-b px-6"><div className="flex items-center gap-5"><SidebarTrigger /><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Evaluation</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div></header><main className="h-[calc(100vh-4rem)] overflow-auto p-4">{children}</main></SidebarInset></SidebarProvider>
}

function OverallStep({ evaluation, history, onNext }: { evaluation: Evaluation; history: EvaluationHistory[]; onNext: () => void }) {
  return <section className="mx-auto max-w-6xl space-y-4"><h1 className="text-3xl font-semibold">Good evening, Aryan</h1><p className="text-muted-foreground">Here’s how your day went.</p><MetricCards metric={evaluation.metrics.overall} /><EvaluationCharts history={history} /><div className="flex justify-end"><Button onClick={onNext} className="cursor-pointer">Continue</Button></div></section>
}

function SkillStep({ evaluation, history, onBack, onNext }: { evaluation: Evaluation; history: EvaluationHistory[]; onBack: () => void; onNext: () => void }) {
  const [skillId, setSkillId] = React.useState("all")
  const metric = skillId === "all" ? evaluation.metrics.overall : evaluation.metrics.skill.find((item) => item.skillId === skillId) ?? evaluation.metrics.overall
  return <section className="mx-auto max-w-6xl space-y-4"><h1 className="text-2xl font-semibold">Skill growth</h1><div className="flex flex-wrap gap-2"><Button variant={skillId === "all" ? "default" : "outline"} onClick={() => setSkillId("all")}>All skills</Button>{evaluation.metrics.skill.map((skill) => <Button key={skill.skillId} variant={skillId === skill.skillId ? "default" : "outline"} onClick={() => setSkillId(skill.skillId)}>Skill {skill.skillId.slice(-4)}</Button>)}</div><MetricCards metric={metric} /><EvaluationCharts history={history} skillId={skillId} /><div className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button onClick={onNext}>Continue</Button></div></section>
}

function MetricCards({ metric }: { metric: Evaluation["metrics"]["overall"] }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Total", metric.total_tasks], ["Completed", metric.completed_tasks], ["Pending", metric.pending_tasks], ["Score", `${Math.round(metric.score * 100)}%`]].map(([label, value]) => <Card key={String(label)}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{value}</CardContent></Card>)}</div>
}

function ReviewStep({ ticketId, evaluation, onBack, onNext }: { ticketId: string; evaluation: Evaluation; onBack: () => void; onNext: () => void }) {
  const current = evaluation.eval_loop[0] ?? { mistakes: "", improvements: "" }
  const [mistakes, setMistakes] = React.useState(current.mistakes)
  const [improvements, setImprovements] = React.useState(current.improvements)
  async function save() { try { await updateEvaluationReview(ticketId, { mistakes, improvements }); onNext() } catch (error) { showError(error) } }
  return <section className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-semibold">What did today teach you?</h1><Card><CardHeader><CardTitle>Mistakes</CardTitle></CardHeader><CardContent><textarea className="min-h-32 w-full rounded-md border p-3" value={mistakes} onChange={(event) => setMistakes(event.target.value)} placeholder="One mistake per line" /></CardContent></Card><Card><CardHeader><CardTitle>Improvements</CardTitle></CardHeader><CardContent><textarea className="min-h-32 w-full rounded-md border p-3" value={improvements} onChange={(event) => setImprovements(event.target.value)} placeholder="One improvement per line" /></CardContent></Card><div className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button onClick={save}>Continue</Button></div></section>
}

function FinishStep({ evaluation, onBack, onFinish }: { evaluation: Evaluation; onBack: () => void; onFinish: () => void }) {
  const metric = evaluation.metrics.overall
  return <section className="mx-auto max-w-3xl space-y-4"><h1 className="text-2xl font-semibold">Your day in review</h1><Card><CardContent className="space-y-3 pt-6"><p>You completed {metric.completed_tasks} of {metric.total_tasks} tasks today.</p><p>Your score was {Math.round(metric.score * 100)}%, with a {metric.verdict} verdict.</p><p className="text-muted-foreground">Finish your evaluation to close the day and mark remaining tasks as missed.</p></CardContent></Card><div className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button onClick={onFinish} className="cursor-pointer">Finish evaluation</Button></div></section>
}

function showError(error: unknown) { toast.add({ title: "Evaluation failed", description: error instanceof Error ? error.message : "Try again", type: "error" }) }
