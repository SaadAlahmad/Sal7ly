import ClientDashboardPage from "@/pages/client/DashboardPage";
import { Route } from "react-router-dom";

const clientRoutes = (
  <>
    <Route path="/dashboard" element={<ClientDashboardPage />} />
    <Route path="/dashboard/jobs" element={<ClientDashboardPage />} />
    <Route path="/dashboard/jobs/new" element={<ClientDashboardPage />} />
    <Route path="/dashboard/jobs/:id" element={<ClientDashboardPage />} />
    <Route path="/dashboard/projects" element={<ClientDashboardPage />} />
    <Route path="/dashboard/projects/:id" element={<ClientDashboardPage />} />
    <Route path="/dashboard/messages" element={<ClientDashboardPage />} />
    <Route path="/dashboard/messages/:id" element={<ClientDashboardPage />} />
    <Route path="/dashboard/profile" element={<ClientDashboardPage />} />
  </>
);

export default clientRoutes;
