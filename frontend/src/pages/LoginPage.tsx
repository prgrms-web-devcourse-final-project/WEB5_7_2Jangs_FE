import LoginForm from "@/components/LoginForm"
import { useNavigate } from "react-router"

export default function LoginPage() {
  const navigate = useNavigate()

  return <LoginForm onSuccess={() => navigate("/documents")} />
}
