import { BrowserRouter, Routes, Route } from "react-router"
import HomePage from "../pages/HomePage"
import PageLayout from "../layouts/PageLayout"

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
