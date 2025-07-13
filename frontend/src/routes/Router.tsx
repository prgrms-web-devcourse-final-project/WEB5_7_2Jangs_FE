import { BrowserRouter, Routes, Route } from "react-router"
import HomePage from "../pages/HomePage"
import PageLayout from "../layouts/PageLayout"
import SignupPage from "@/pages/SignupPage"
import LoginPage from "@/pages/LoginPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import DocumentsPage from "@/pages/DocumentsPage"
import DocumentDetailPage from "@/pages/DocumentDetailPage"
import MergePage from "@/pages/MergePage"

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/merge" element={<MergePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
