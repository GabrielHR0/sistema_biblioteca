import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./auth/login";
import { ForgotPassword } from "./auth/forgotPassword";
import { ResetPassword } from "./auth/resetPassword";
import { Dashboard } from "./dashboard/dashboard";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/password-reset" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  </BrowserRouter>
);
