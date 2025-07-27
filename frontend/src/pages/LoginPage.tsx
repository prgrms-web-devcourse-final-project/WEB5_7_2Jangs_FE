import LoginForm from "@/components/LoginForm"
import { useNavigate, useLocation } from "react-router"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { checkSession } = useAuth()

  const handleSuccess = async (user: { id: number; email: string }) => {
    // 로그인 성공 후 세션을 다시 체크하여 인증 상태 업데이트
    await checkSession()

    // 원래 가려던 페이지로 리다이렉트 (없으면 documents 페이지로)
    const from = location.state?.from?.pathname || "/documents"
    navigate(from, { replace: true })
  }

  return <LoginForm onSuccess={handleSuccess} />
}
