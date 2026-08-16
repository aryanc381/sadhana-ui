import { request } from "./client"

export type Customer = {
  id: string
  name: string
  email: string
  phone_number: string
}

export type SignupInput = {
  name: string
  email: string
  phone_number: string
  password: string
}

// Create an account and start a session.
export function signup(input: SignupInput) {
  return request<{ customer: Customer }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

// Log in and start a session.
export function login(email: string, password: string) {
  return request<{ customer: Customer }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// Load the current authenticated customer.
export function getMe() {
  return request<{ customer: Customer }>("/auth/me")
}

// End the current session.
export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" })
}
