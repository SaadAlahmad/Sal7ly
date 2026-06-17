import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import RoleRoute from "@/components/shared/RoleRoute";
import publicRoutes from "./publicRoutes";
import clientRoutes from "./clientRoutes";
import craftsmanRoutes from "./craftsmanRoutes";
import adminRoutes from "./adminRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {publicRoutes}

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedType="user" />}>{clientRoutes}</Route>

        <Route element={<RoleRoute allowedType="craftsman" />}>
          {craftsmanRoutes}
        </Route>

        <Route element={<RoleRoute allowedType="admin" />}>{adminRoutes}</Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
