import { Link, useNavigate } from "react-router"
import Logo from "../components/Logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/api/apiClient"

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleSignUp = () => {
    navigate("/signup")
  }

  const handleLogin = () => {
    navigate("/login")
  }

  const handleLogout = () => {
    logout()
    apiClient.user.logout()
    navigate("/")
  }

  return (
    <header className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to={isAuthenticated ? "/documents" : "/"}
            className="hover:opacity-80 transition-opacity"
          >
            <div className="w-[200px]">
              <Logo withText />
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-slate-700 font-medium">
                  안녕하세요, {user.name}님!
                </span>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-black text-white hover:bg-gray-800 border-black px-6 py-2 rounded-md"
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSignUp}
                  variant="outline"
                  className="bg-black text-white hover:bg-gray-800 border-black px-6 py-2 rounded-md"
                >
                  회원가입
                </Button>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="bg-black text-white hover:bg-gray-800 border-black px-6 py-2 rounded-md"
                >
                  로그인
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
