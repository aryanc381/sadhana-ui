"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signup } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = React.useState({ name: "", email: "", phone_number: "", password: "" })
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true)
    try { await signup(form); router.replace("/dashboard") }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create account") }
    finally { setLoading(false) }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><form onSubmit={submit} className="grid w-full max-w-sm gap-4"><div><h1 className="text-3xl font-semibold">Start your practice</h1><p className="text-sm text-muted-foreground">Create your Sadhana account.</p></div><Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /><Input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /><Input type="tel" placeholder="Phone number" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} required /><Input type="password" placeholder="Password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button><p className="text-center text-sm text-muted-foreground">Already have an account? <Link className="text-foreground underline" href="/login">Log in</Link></p></form></main>
}
