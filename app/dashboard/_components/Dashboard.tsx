import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ChevronRight } from "lucide-react"
import { AppSidebar } from "./AppSidebar"

export function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 items-center border-b px-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-8" />
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-4 text-2xl"
            >
              <span className="text-muted-foreground">
                Build Your Application
              </span>
              <ChevronRight className="size-6 text-muted-foreground" />
              <span>Data Fetching</span>
            </nav>
          </div>
        </header>
        <main className="flex-1 p-6" />
      </SidebarInset>
    </SidebarProvider>
  )
}
