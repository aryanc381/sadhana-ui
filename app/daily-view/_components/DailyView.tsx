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
  const openTaskRef = React.useRef<(() => void) | null>(null)
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

  const registerOpenTask = React.useCallback((openTask: () => void) => {
    openTaskRef.current = openTask
  }, [])

  React.useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== "d") return
      event.preventDefault()
      openTaskRef.current?.()
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [])

  return <SidebarProvider><AppSidebar /><SidebarInset className="min-w-0 overflow-x-hidden"><header className="flex h-16 items-center border-b px-6"><div className="flex items-center gap-5"><SidebarTrigger /><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Daily View</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div></header><main className="min-w-0 flex-1 p-6">{loading ? <Skeleton className="h-[40rem] w-full" /> : !view ? <p className="text-sm text-muted-foreground">No daily view available.</p> : <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_2fr_1fr]"><div className="space-y-6"><PreviousDayReview review={view.previous_day} /><TodayReview ticketId={view.today.ticket.id} review={view.today.review} /></div><TodayTasks ticket={view.today.ticket} skills={skills} onChange={updateTicket} onShortcut={registerOpenTask} /><div className="space-y-6"><Card className="h-40"><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Calendar integration coming next.</CardContent></Card><Card className="min-h-80"><CardHeader><CardTitle>Calendar slots</CardTitle></CardHeader></Card></div></div>}</main></SidebarInset></SidebarProvider>
}
