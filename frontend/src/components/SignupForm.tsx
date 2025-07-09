import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, User, Lock, Shield } from "lucide-react"

const signupSchema = z
  .object({
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
    email: z.string().email("올바른 이메일 주소를 입력해주세요"),
    verificationCode: z
      .string()
      .min(6, "인증코드는 6자리입니다")
      .max(6, "인증코드는 6자리입니다"),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "비밀번호는 대소문자와 숫자를 포함해야 합니다",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const email = watch("email")

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      // 회원가입 로직 구현
      console.log("회원가입 데이터:", data)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션
      alert("회원가입이 완료되었습니다!")
    } catch (error) {
      console.error("회원가입 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationCode = async () => {
    const isEmailValid = await trigger("email")
    if (!isEmailValid || !email) return

    setIsLoading(true)
    try {
      // 인증코드 발송 로직
      console.log("인증코드 발송:", email)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsCodeSent(true)
      alert("인증코드가 발송되었습니다!")
    } catch (error) {
      console.error("인증코드 발송 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold text-slate-800">
            회원가입
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            새로운 계정을 만들어보세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-base font-medium text-slate-700"
              >
                이름
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력해주세요"
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-base">
                    {errors.name.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base font-medium text-slate-700"
              >
                이메일
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일을 입력해주세요"
                    className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                    {...register("email")}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={isLoading || !email || !!errors.email}
                  className="h-12 px-4 border-slate-200 hover:bg-slate-50 bg-transparent text-base"
                >
                  {isCodeSent ? "재발송" : "인증"}
                </Button>
              </div>
              {errors.email && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-base">
                    {errors.email.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 인증코드 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="verificationCode"
                className="text-base font-medium text-slate-700"
              >
                인증코드
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="6자리 인증코드를 입력해주세요"
                  maxLength={6}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                  {...register("verificationCode")}
                />
              </div>
              {errors.verificationCode && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-base">
                    {errors.verificationCode.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-base font-medium text-slate-700"
              >
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  className="pl-10 pr-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-base">
                    {errors.password.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-base font-medium text-slate-700"
              >
                비밀번호 확인
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="pl-10 pr-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <Alert className="py-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600 text-base">
                    {errors.confirmPassword.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6 text-base"
            >
              {isLoading ? "처리중..." : "회원가입"}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-base text-slate-600">
              이미 계정이 있으신가요?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium text-base"
              >
                로그인
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
