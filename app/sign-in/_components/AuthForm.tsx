"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { safeNextPath } from "@/lib/auth-paths";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<AuthMode>("sign-in");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const destination = safeNextPath(nextPath);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? "Could not authenticate.");
        return;
      }

      toast.add({
        title: isSignUp ? "Account created" : "Signed in",
        description: isSignUp
          ? "Welcome to Sadhana."
          : "Continuing to your workspace.",
        type: "success",
      });

      router.replace(destination);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sadhana
          </p>
          <CardTitle className="text-xl">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Set up an account before entering your weekly goals and daily view."
              : "Authentication is required before you can use the app."}
          </CardDescription>
        </div>
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 rounded-lg bg-muted p-1"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            variant={!isSignUp ? "default" : "ghost"}
            className="h-7"
            onClick={() => {
              setMode("sign-in");
              setError(null);
            }}
          >
            Sign in
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            variant={isSignUp ? "default" : "ghost"}
            className="h-7"
            onClick={() => {
              setMode("sign-up");
              setError(null);
            }}
          >
            Sign up
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            {isSignUp ? (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {isSignUp ? (
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </Field>
            ) : null}
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? isSignUp
                  ? "Creating account…"
                  : "Signing in…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
