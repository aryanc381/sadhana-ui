"use client"

import * as React from "react"
import { updateDailyReview } from "@/lib/api/daily-view"
import type { DailyReview } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

export function TodayReview({ ticketId, review }: { ticketId: string; review: DailyReview }) {
  const [mistakes, setMistakes] = React.useState(String(review.mistakes ?? ""))
  const [improvements, setImprovements] = React.useState(String(review.improvements ?? ""))
  const [saving, setSaving] = React.useState(false)

  async function save() {
    setSaving(true)
    try {
      await updateDailyReview(ticketId, { mistakes, improvements })
      toast.add({ title: "Review saved", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not save review", description: error instanceof Error ? error.message : "Try again", type: "error" })
    } finally { setSaving(false) }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Today’s review</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={mistakes} onChange={(event) => setMistakes(event.target.value)} placeholder="Mistakes" />
        <Textarea value={improvements} onChange={(event) => setImprovements(event.target.value)} placeholder="Improvements" />
        <Button onClick={save} disabled={saving} className="cursor-pointer">{saving ? "Saving..." : "Save review"}</Button>
      </CardContent>
    </Card>
  )
}
