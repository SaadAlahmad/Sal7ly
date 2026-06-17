import { Route } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LandingPage from "@/pages/public/LandingPage";
import CraftsmenDirectoryPage from "@/pages/public/CraftsmenDirectoryPage";
import CraftsmanProfilePage from "@/pages/public/CraftsmanProfilePage";

const publicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/craftsmen" element={<CraftsmenDirectoryPage />} />
    <Route path="/craftsmen/:id" element={<CraftsmanProfilePage />} />
  </>
);

export default publicRoutes;
