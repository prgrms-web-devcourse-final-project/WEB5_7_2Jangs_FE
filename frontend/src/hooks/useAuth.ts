import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { apiClient } from "@/api/apiClient"
import type { SessionCheckResponse } from "@/api/__generated__"

interface User {
  id: number
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  checkSession: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const response: SessionCheckResponse = await apiClient.auth.checkSession()

      if (response.id && response.name) {
        setUser({
          id: response.id,
          name: response.name,
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("세션 체크 실패:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    // 쿠키나 로컬 스토리지 정리 (필요시)
    // document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  }, [])

  // 앱 시작 시 세션 체크
  useEffect(() => {
    checkSession()
  }, [checkSession])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    checkSession,
    logout,
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서 사용되어야 합니다")
  }
  return context
}

// 레거시 함수 (기존 코드와의 호환성을 위해 유지)
export const validateSession = async () => {
  const res = await apiClient.auth.checkSession()
  console.log("validateSession", res)
  return res
}
