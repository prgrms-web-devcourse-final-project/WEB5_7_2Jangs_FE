import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  )
}

// Global Alert System
interface AlertItem {
  id: string
  message: string
  variant?: "default" | "destructive"
  duration?: number
}

interface AlertContextType {
  alerts: AlertItem[]
  showAlert: (
    message: string,
    variant?: "default" | "destructive",
    duration?: number,
  ) => void
  hideAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  const showAlert = useCallback(
    (
      message: string,
      variant: "default" | "destructive" = "default",
      duration = 5000,
    ) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newAlert: AlertItem = { id, message, variant, duration }

      setAlerts((prev) => [...prev, newAlert])

      if (duration > 0) {
        setTimeout(() => {
          hideAlert(id)
        }, duration)
      }
    },
    [],
  )

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  // Set global alert function
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).customAlert = showAlert
    }

    return () => {
      if (typeof window !== "undefined") {
        ;(window as any).customAlert = undefined
      }
    }
  }, [showAlert])

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
      {children}
      <AlertContainer />
    </AlertContext.Provider>
  )
}

function AlertContainer() {
  const context = useContext(AlertContext)
  if (!context) return null

  const { alerts, hideAlert } = context

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.variant} className="shadow-lg">
          <AlertDescription className="flex items-center justify-between">
            <span>{alert.message}</span>
            <button
              onClick={() => hideAlert(alert.id)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}

// Global alert function
export function alert(
  message: string,
  variant: "default" | "destructive" = "default",
) {
  // This will be set by the AlertProvider
  if (typeof window !== "undefined" && (window as any).customAlert) {
    ;(window as any).customAlert(message, variant)
  } else {
    // Fallback to native alert
    window.alert(message)
  }
}

export { Alert, AlertTitle, AlertDescription }
