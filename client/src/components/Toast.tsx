import { useEffect } from "react"
import { XIcon } from "lucide-react"

type ToastProps = {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-primary/10 px-6 py-3 text-sm text-primary">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="hover:opacity-70">
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
