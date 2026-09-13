import { useEffect } from "react"
import { XIcon } from "lucide-react"

type ToastProps = {
  message: string
  variant?: "info" | "error"
  onDismiss: () => void
}

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  const isError = variant === "error"

  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-border px-6 py-3 text-sm ${
        isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
      }`}
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="hover:opacity-70">
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
