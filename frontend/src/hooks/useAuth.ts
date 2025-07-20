import { apiClient } from "@/api/apiClient"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

// 인증 상태 인터페이스
interface AuthState {
  userId: number | null
  isAuthenticated: boolean
  isLoading: boolean

  // 액션들
  login: (id: number) => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
  validateSession: () => Promise<void>
}

// zustand store 생성 (persist 미들웨어 사용)
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      isAuthenticated: false,
      isLoading: true,

      login: (id: number) => {
        console.log("User logged in:", id)
        set({
          userId: id,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: async () => {
        const { setLoading } = get()
        setLoading(true)

        try {
          await apiClient.user.logout()
          console.log("로그아웃 성공")
        } catch (error) {
          console.error("로그아웃 실패:", error)
        } finally {
          set({
            userId: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // 세션 유효성 검증
      validateSession: async () => {
        const { userId, setLoading } = get()

        if (!userId) {
          setLoading(false)
          return
        }

        try {
          // 사용자의 문서 목록을 가져와서 세션이 유효한지 확인
          await apiClient.document.readList({ userId })
          console.log("Session is valid for user:", userId)
          set({ isAuthenticated: true, isLoading: false })
        } catch (error) {
          console.warn("Session validation failed:", error)
          // 세션이 무효하면 로그아웃 처리
          set({
            userId: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      partialize: (state) => ({
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }), // 저장할 상태만 선택 (isLoading은 제외)
    },
  ),
)

// 컴포넌트에서 사용할 훅
export function useAuth() {
  const store = useAuthStore()

  // 초기 로딩 시 세션 검증
  const { userId, isAuthenticated, validateSession, setLoading } = store

  // 마운트 시 세션 검증 (한 번만 실행)
  useEffect(() => {
    console.log("useAuth useEffect - validating session")
    validateSession()
  }, [validateSession])

  return store
}

// 호환성을 위한 getCurrentUserId 함수
export function getCurrentUserId(): number {
  const { userId } = useAuthStore.getState()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  return userId
}
