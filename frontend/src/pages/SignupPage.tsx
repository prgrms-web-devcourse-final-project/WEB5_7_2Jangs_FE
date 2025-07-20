import SignupForm from "@/components/SignupForm"
import { useNavigate } from "react-router"

export default function SignupPage() {
  const navigate = useNavigate()

  return (
    <SignupForm
      onSuccess={() => {
        navigate("/login")
      }}
    />
  )
}
