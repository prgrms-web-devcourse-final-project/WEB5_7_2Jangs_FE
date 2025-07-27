import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { createContext, useContext, useState, useCallback } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

// Global Dialog System
interface DialogItem {
  id: string
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  resolve: (result: boolean) => void
  isAlert?: boolean // 단순 알림인지 확인 다이얼로그인지 구분
}

interface DialogContextType {
  dialogs: DialogItem[]
  showDialog: (
    title: string,
    description?: string,
    options?: {
      confirmText?: string
      cancelText?: string
      variant?: "default" | "destructive"
    },
  ) => Promise<boolean>
  showAlertDialog: (
    message: string,
    title?: string,
    variant?: "default" | "destructive",
  ) => Promise<void>
  hideDialog: (id: string, result: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogItem[]>([])

  const showDialog = useCallback(
    (
      title: string,
      description?: string,
      options: {
        confirmText?: string
        cancelText?: string
        variant?: "default" | "destructive"
      } = {},
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newDialog: DialogItem = {
          id,
          title,
          description,
          confirmText: options.confirmText || "확인",
          cancelText: options.cancelText || "취소",
          variant: options.variant || "default",
          resolve,
          isAlert: false,
        }

        setDialogs((prev) => [...prev, newDialog])
      })
    },
    [],
  )

  const showAlertDialog = useCallback(
    (
      message: string,
      title?: string,
      variant?: "default" | "destructive",
    ): Promise<void> => {
      return new Promise((resolve) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newDialog: DialogItem = {
          id,
          title: title || "알림",
          description: message,
          confirmText: "확인",
          cancelText: "",
          variant: variant || "default",
          resolve: () => resolve(), // 항상 성공으로 처리
          isAlert: true,
        }

        setDialogs((prev) => [...prev, newDialog])
      })
    },
    [],
  )

  const hideDialog = useCallback((id: string, result: boolean) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id)
      if (dialog) {
        dialog.resolve(result)
      }
      return prev.filter((d) => d.id !== id)
    })
  }, [])

  // Set global confirm and alert functions
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).customConfirm = (
        message: string,
        title?: string,
      ): Promise<boolean> => {
        return showDialog(title || "확인", message)
      }
      ;(window as any).customAlertDialog = showAlertDialog
    }

    return () => {
      if (typeof window !== "undefined") {
        ;(window as any).customConfirm = undefined
        ;(window as any).customAlertDialog = undefined
      }
    }
  }, [showDialog, showAlertDialog])

  return (
    <DialogContext.Provider
      value={{ dialogs, showDialog, showAlertDialog, hideDialog }}
    >
      {children}
      <DialogContainer />
    </DialogContext.Provider>
  )
}

function DialogContainer() {
  const context = useContext(DialogContext)
  if (!context) return null

  const { dialogs, hideDialog } = context

  return (
    <>
      {dialogs.map((dialog) => (
        <AlertDialog key={dialog.id} open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
              {dialog.description && (
                <AlertDialogDescription>
                  {dialog.description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              {!dialog.isAlert && dialog.cancelText && (
                <AlertDialogCancel onClick={() => hideDialog(dialog.id, false)}>
                  {dialog.cancelText}
                </AlertDialogCancel>
              )}
              <AlertDialogAction
                onClick={() => hideDialog(dialog.id, true)}
                className={
                  dialog.variant === "destructive"
                    ? cn(buttonVariants({ variant: "destructive" }))
                    : undefined
                }
              >
                {dialog.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}

// Global confirm function
export function confirm(message: string, title?: string): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).customConfirm) {
    return (window as any).customConfirm(message, title)
  } else {
    // Fallback to native confirm
    return Promise.resolve(window.confirm(message))
  }
}

// Global alertDialog function
export function alertDialog(
  message: string,
  title?: string,
  variant?: "default" | "destructive",
): Promise<void> {
  if (typeof window !== "undefined" && (window as any).customAlertDialog) {
    return (window as any).customAlertDialog(message, title, variant)
  } else {
    // Fallback to native alert
    window.alert(message)
    return Promise.resolve()
  }
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
