type ApiResponse<T> = {
  status: number
  payload: T
}

const API_BASE_URL = process.env.NEXT_PUBLIC_SADHANA_API_URL ?? "/api/v1"

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  const body = (await response.json()) as ApiResponse<T>

  if (body.status < 200 || body.status >= 300) {
    const payload = body.payload as T & { message?: string }
    throw new Error(payload?.message ?? "Something went wrong")
  }

  return body.payload
}
