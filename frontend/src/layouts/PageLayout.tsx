import { Outlet } from "react-router"
import Header from "./Header"

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-white grid grid-rows-[auto_1fr]">
      <Header />
      <main className="bg-gradient-to-br from-slate-50 to-slate-100 ">
        <Outlet />
      </main>
    </div>
  )
}
