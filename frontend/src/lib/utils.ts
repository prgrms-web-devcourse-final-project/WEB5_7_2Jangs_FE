import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global alert function that uses custom Alert component
export function alert(
  message: string,
  variant: "default" | "destructive" = "default",
) {
  if (typeof window !== "undefined" && (window as any).customAlert) {
    ;(window as any).customAlert(message, variant)
  } else {
    // Fallback to native alert
    window.alert(message)
  }
}

// Global confirm function that uses custom AlertDialog component
export function confirm(message: string, title?: string): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).customConfirm) {
    return (window as any).customConfirm(message, title)
  } else {
    // Fallback to native confirm
    return Promise.resolve(window.confirm(message))
  }
}

// Global alertDialog function that uses custom AlertDialog component
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
