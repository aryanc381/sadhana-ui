"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { getMe } from "@/lib/api/auth"

const publicPaths = new Set(["/", "/login", "/signup"])

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = React.useState(false)
  const isPublic = publicPaths.has(pathname)

  React.useEffect(() => {
    if (isPublic) return

    let active = true
    getMe()
      .then(() => { if (active) setAuthorized(true) })
      .catch(() => { if (active) router.replace("/login") })
    return () => { active = false }
  }, [isPublic, router])

  if (!isPublic && !authorized) return <div className="min-h-screen" />
  return children
}
