import LoginForm from "@/components/LoginForm"
import { useNavigate } from "react-router"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSuccess = (user: { id: number; email: string }) => {
    login(user.id)
    navigate("/documents")
  }

  return <LoginForm onSuccess={handleSuccess} />
}
