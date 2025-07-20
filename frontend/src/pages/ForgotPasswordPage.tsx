import ForgotPasswordForm from "@/components/ForgotPasswordForm"
import { useNavigate } from "react-router"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  return <ForgotPasswordForm onSuccess={() => navigate("/login")} />
}
