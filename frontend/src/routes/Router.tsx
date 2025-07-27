import { BrowserRouter, Routes, Route } from "react-router"
import HomePage from "../pages/HomePage"
import PageLayout from "../layouts/PageLayout"
import SignupPage from "@/pages/SignupPage"
import LoginPage from "@/pages/LoginPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import DocumentsPage from "@/pages/DocumentsPage"
import DocumentDetailPage from "@/pages/DocumentDetailPage"
import MergePage from "@/pages/MergePage"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merge"
            element={
              <ProtectedRoute>
                <MergePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
