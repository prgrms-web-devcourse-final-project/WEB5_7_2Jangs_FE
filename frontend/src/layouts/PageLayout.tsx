import { Outlet } from "react-router"
import Header from "./Header"

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
