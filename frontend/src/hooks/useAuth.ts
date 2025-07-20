import { apiClient } from "@/api/apiClient"
import { useState, useEffect } from "react"

const USER_ID_KEY = "userId"

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(null)
  console.log("userId", userId)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("useAuth useEffect")
    // sessionStorage에서 userId 로드
    const storedUserId = sessionStorage.getItem(USER_ID_KEY)
    if (storedUserId) {
      setUserId(Number(storedUserId))
    }
    setIsLoading(false)
  }, [])

  const login = (id: number) => {
    setUserId(id)
    sessionStorage.setItem(USER_ID_KEY, id.toString())
  }

  const logout = async () => {
    try {
      await apiClient.user.logout()
      setUserId(null)
      sessionStorage.removeItem(USER_ID_KEY)
    } catch (error) {
      console.error("로그아웃 실패:", error)
    } finally {
      setUserId(null)
      sessionStorage.removeItem(USER_ID_KEY)
    }
  }

  const isAuthenticated = userId !== null

  return {
    userId,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

export function getCurrentUserId(): number {
  const userId = sessionStorage.getItem(USER_ID_KEY)
  // 임시로 userId가 없으면 1을 반환 (개발용)
  return userId ? Number(userId) : 1
}
