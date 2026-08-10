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
        <header className="flex h-16 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
