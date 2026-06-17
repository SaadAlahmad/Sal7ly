import CraftsmanDashboardPage from "@/pages/craftsman/DashboardPage";
import { Route } from "react-router-dom";

const craftsmanRoutes = (
  <>
    <Route path="/dashboard" element={<CraftsmanDashboardPage />} />
    <Route path="/dashboard/browse" element={<CraftsmanDashboardPage />} />
    <Route
      path="/dashboard/applications"
      element={<CraftsmanDashboardPage />}
    />
    <Route path="/dashboard/projects" element={<CraftsmanDashboardPage />} />
    <Route
      path="/dashboard/projects/:id"
      element={<CraftsmanDashboardPage />}
    />
    <Route path="/dashboard/messages" element={<CraftsmanDashboardPage />} />
    <Route
      path="/dashboard/messages/:id"
      element={<CraftsmanDashboardPage />}
    />
    <Route path="/dashboard/profile" element={<CraftsmanDashboardPage />} />
  </>
);

export default craftsmanRoutes;
