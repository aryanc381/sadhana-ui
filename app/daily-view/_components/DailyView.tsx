"use client"

import * as React from "react"
import { format } from "date-fns"
import Link from "next/link"
import { AppSidebar } from "@/app/dashboard/_components/AppSidebar"
import { getSkills } from "@/lib/api/skills"
import { getDailyView } from "@/lib/api/daily-view"
import type { DailyTicket, DailyViewData, Skill } from "@/lib/types/sadhana"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { PreviousDayReview } from "./PreviousDayReview"
import { TodayReview } from "./TodayReview"
import { TodayTasks } from "./TodayTasks"

export function DailyView() {
  const [view, setView] = React.useState<DailyViewData>()
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [loading, setLoading] = React.useState(true)
  const date = format(new Date(), "yyyy-MM-dd")

  React.useEffect(() => {
    Promise.all([getDailyView(date), getSkills()]).then(([nextView, nextSkills]) => {
      setView(nextView); setSkills(nextSkills)
    }).catch((error) => toast.add({ title: "Could not load daily view", description: error instanceof Error ? error.message : "Try again", type: "error" })).finally(() => setLoading(false))
  }, [date])

  function updateTicket(ticket: DailyTicket) {
    if (!view) return
    setView({ ...view, today: { ...view.today, ticket } })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <DailyViewHeader />
        <main className="h-[calc(100vh-4rem)] min-w-0 overflow-hidden p-4">
          {loading ? <Skeleton className="h-full w-full" /> : !view ? <p className="text-sm text-muted-foreground">No daily view available.</p> : <DailyViewContent view={view} skills={skills} onTicketChange={updateTicket} />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DailyViewHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-6">
      <div className="flex items-center gap-5">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Daily View</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

function DailyViewContent({ view, skills, onTicketChange }: { view: DailyViewData; skills: Skill[]; onTicketChange: (ticket: DailyTicket) => void }) {
  return (
    <div className="grid h-full min-w-0 gap-[calc(0.75rem+0.15vw)] lg:grid-cols-[1fr_2fr_1fr]">
      <div className="flex min-h-0 flex-col gap-[calc(0.75rem+0.15vw)]">
        <PreviousDayReview review={view.previous_day} />
        <TodayReview ticketId={view.today.ticket.id} review={view.today.review} />
      </div>
      <TodayTasks ticket={view.today.ticket} skills={skills} onChange={onTicketChange} />
      <CalendarPanel />
    </div>
  )
}

function CalendarPanel() {
  return (
    <div className="flex min-h-0 flex-col gap-[calc(0.75rem+0.15vw)]">
      <Card className="shrink-0">
        <CardHeader><CardTitle>Calendar</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Calendar integration coming next.</CardContent>
      </Card>
      <Card className="min-h-0 flex-1 overflow-hidden">
        <CardHeader><CardTitle>Calendar slots</CardTitle></CardHeader>
      </Card>
    </div>
  )
}
