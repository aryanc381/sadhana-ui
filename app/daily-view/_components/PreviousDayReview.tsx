import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyReview } from "@/lib/types/sadhana"

function list(value: string | string[]) {
  return Array.isArray(value) ? value : value ? [value] : []
}

export function PreviousDayReview({ review }: { review: DailyReview }) {
  return (
    <Card className="min-h-0 flex-1 overflow-hidden">
      <CardHeader><CardTitle>Previous day</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <ReviewList title="Mistakes" items={list(review.mistakes)} />
        <ReviewList title="Improvements" items={list(review.improvements)} />
      </CardContent>
    </Card>
  )
}

function ReviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      {items.length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : <p className="text-sm text-muted-foreground">Nothing recorded.</p>}
    </div>
  )
}
