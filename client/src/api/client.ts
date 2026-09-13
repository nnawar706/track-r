const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type ApiErrorBody = {
  message?: string
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null
}

export async function apiRequest<TResponse>(path: string, options?: RequestInit): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    })
  } catch (error) {
    console.error("[apiRequest]", error)
    throw new ApiError(0, "Unable to reach the server. Please try again.")
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again."
    try {
      const body: unknown = await response.json()
      if (isApiErrorBody(body) && body.message) {
        message = body.message
      }
    } catch (error) {
      console.error("[apiRequest] failed to parse error response", error)
    }
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as TResponse
}
