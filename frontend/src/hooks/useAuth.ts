import { useState, useEffect } from "react"

const USER_ID_KEY = "userId"

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorage에서 userId 로드
    const storedUserId = localStorage.getItem(USER_ID_KEY)
    if (storedUserId) {
      setUserId(Number(storedUserId))
    }
    setIsLoading(false)
  }, [])

  const login = (id: number) => {
    setUserId(id)
    localStorage.setItem(USER_ID_KEY, id.toString())
  }

  const logout = () => {
    setUserId(null)
    localStorage.removeItem(USER_ID_KEY)
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

// 현재 인증된 userId를 가져오는 간단한 함수 (임시 - 테스트용)
export function getCurrentUserId(): number {
  const userId = localStorage.getItem(USER_ID_KEY)
  // 임시로 userId가 없으면 1을 반환 (개발용)
  return userId ? Number(userId) : 1
}
