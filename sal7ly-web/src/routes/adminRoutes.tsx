import AdminDashboardPage from "@/pages/admin/DashboardPage";
import { Route } from "react-router-dom";

const adminRoutes = (
  <>
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route path="/admin/craftsmen" element={<AdminDashboardPage />} />
    <Route path="/admin/disputes" element={<AdminDashboardPage />} />
    <Route path="/admin/categories" element={<AdminDashboardPage />} />
    <Route path="/admin/support" element={<AdminDashboardPage />} />
  </>
);

export default adminRoutes;
