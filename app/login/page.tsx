"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true)
    try { await login(email, password); router.replace("/dashboard") }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not login") }
    finally { setLoading(false) }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="grid w-full max-w-sm gap-4"><div><h1 className="text-3xl font-semibold">Welcome back</h1><p className="text-sm text-muted-foreground">Log in to continue your practice.</p></div><Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</Button><p className="text-center text-sm text-muted-foreground">New here? <Link className="text-foreground underline" href="/signup">Create an account</Link></p></form></main>
}
