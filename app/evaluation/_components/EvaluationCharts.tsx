"use client"

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import type { EvaluationHistory } from "@/lib/types/sadhana"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EvaluationCharts({ history, skillId = "all" }: { history: EvaluationHistory[]; skillId?: string }) {
  const data = history.map((item) => {
    const metric = skillId === "all" ? item.metrics?.overall : item.metrics?.skill.find((skill) => skill.skillId === skillId)
    return { date: item.date.slice(5), score: metric ? Math.round(metric.score * 100) : 0 }
  })
  return <Card><CardHeader><CardTitle>{skillId === "all" ? "Overall progress" : "Skill progress"}</CardTitle></CardHeader><CardContent><LineChart width={900} height={320} data={data} className="max-w-full"><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#2f9e44" strokeWidth={3} /></LineChart></CardContent></Card>
}
