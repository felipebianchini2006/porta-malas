import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
