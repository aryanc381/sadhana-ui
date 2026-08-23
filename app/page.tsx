"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { getMe, login, signup } from "@/lib/api/auth"

export default function Home() {
  const router = useRouter()
  const [dialog, setDialog] = React.useState<"login" | "signup" | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = React.useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  })

  React.useEffect(() => {
    getMe().then(() => router.replace("/dashboard")).catch(() => undefined)
  }, [router])

  function openDialog(nextDialog: "login" | "signup") {
    setError("")
    setDialog(nextDialog)
  }

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(loginForm.email, loginForm.password)
      router.replace("/dashboard")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not login")
    } finally {
      setLoading(false)
    }
  }

  async function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signup(signupForm)
      router.replace("/dashboard")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-[6vw] py-[8vh]">
      <section className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <h1 className="font-[family-name:var(--font-aldrich)] text-4xl lowercase tracking-wide sm:text-5xl">
          sadhana
        </h1>
        <p className="max-w-md text-base text-muted-foreground sm:text-lg">
          making growth as quantitative as possible.
        </p>
        <div className="flex items-center justify-center gap-3">
          <RainbowButton type="button" onClick={() => openDialog("login")}>
            Login
          </RainbowButton>
          <RainbowButton type="button" variant="outline" onClick={() => openDialog("signup")}>
            Signup
          </RainbowButton>
        </div>
      </section>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "login" ? "Welcome back" : "Create your account"}</DialogTitle>
            <DialogDescription>
              {dialog === "login" ? "Log in to continue to your dashboard." : "Start tracking your growth with Sadhana."}
            </DialogDescription>
          </DialogHeader>

          {dialog === "login" ? (
            <form className="grid gap-4" onSubmit={submitLogin}>
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <RainbowButton type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</RainbowButton>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={submitSignup}>
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" value={signupForm.name} onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-phone">Phone</Label>
                <Input id="signup-phone" type="tel" value={signupForm.phone_number} onChange={(event) => setSignupForm({ ...signupForm, phone_number: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" minLength={8} value={signupForm.password} onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })} required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <RainbowButton type="submit" variant="outline" disabled={loading}>{loading ? "Creating..." : "Signup"}</RainbowButton>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
