"use client"

import * as React from "react"
import { updateDailyReview } from "@/lib/api/daily-view"
import type { DailyReview } from "@/lib/types/sadhana"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

function list(value: string | string[]) {
  return Array.isArray(value) ? value : value.split("\n").map((item) => item.trim()).filter(Boolean)
}

export function TodayReview({ ticketId, review }: { ticketId: string; review: DailyReview }) {
  const [mistakes, setMistakes] = React.useState(String(review.mistakes ?? ""))
  const [improvements, setImprovements] = React.useState(String(review.improvements ?? ""))
  const [editing, setEditing] = React.useState<"mistakes" | "improvements">()
  const [draft, setDraft] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  function edit(type: "mistakes" | "improvements") {
    setEditing(type)
    setDraft(type === "mistakes" ? mistakes : improvements)
  }

  async function copy(item: string) {
    await navigator.clipboard.writeText(item)
    toast.add({ title: "Copied", type: "success" })
  }

  async function save() {
    const nextMistakes = editing === "mistakes" ? draft : mistakes
    const nextImprovements = editing === "improvements" ? draft : improvements
    setSaving(true)
    try {
      await updateDailyReview(ticketId, { mistakes: nextMistakes, improvements: nextImprovements })
      setMistakes(nextMistakes); setImprovements(nextImprovements); setEditing(undefined)
      toast.add({ title: "Review saved", type: "success" })
    } catch (error) {
      toast.add({ title: "Could not save review", description: error instanceof Error ? error.message : "Try again", type: "error" })
    } finally { setSaving(false) }
  }

  return <Card className="min-h-0 flex-1 overflow-hidden"><CardHeader><CardTitle>Today’s review</CardTitle></CardHeader><CardContent className="min-h-0 space-y-5 overflow-auto"><ReviewList title="Mistakes" items={list(mistakes)} onEdit={() => edit("mistakes")} onCopy={copy} /><ReviewList title="Improvements" items={list(improvements)} onEdit={() => edit("improvements")} onCopy={copy} /></CardContent><Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(undefined)}><DialogContent><DialogHeader><DialogTitle>Edit {editing}</DialogTitle></DialogHeader><Textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Add ${editing} as bullet points, one per line`} /><DialogFooter><Button onClick={save} disabled={saving} className="cursor-pointer">{saving ? "Saving..." : "Save review"}</Button></DialogFooter></DialogContent></Dialog></Card>
}

function ReviewList({ title, items, onEdit, onCopy }: { title: string; items: string[]; onEdit: () => void; onCopy: (item: string) => void }) {
  return <div onDoubleClick={onEdit}><h3 className="mb-2 font-medium">{title}</h3>{items.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{items.map((item, index) => <li key={`${item}-${index}`} onClick={() => void onCopy(item)} className="cursor-copy">{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">Nothing recorded.</p>}</div>
}
