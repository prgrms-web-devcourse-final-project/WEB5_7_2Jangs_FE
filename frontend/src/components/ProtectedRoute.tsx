import React, { type ReactNode } from "react"
import { Navigate, useLocation } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import Loading from "./Loading"

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loading text="인증 정보를 확인하는 중..." />
  }

  if (!isAuthenticated) {
    // 로그인 페이지로 리다이렉트하면서 현재 경로를 저장
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
