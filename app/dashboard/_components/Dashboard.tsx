import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

export function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 items-center border-b px-6">
          <div className="flex items-center gap-5">
            <SidebarTrigger />
            <span className="text-[1vw]">Dashboard</span>
          </div>
        </header>
        <main className="flex-1 p-6" />
      </SidebarInset>
    </SidebarProvider>
  )
}
