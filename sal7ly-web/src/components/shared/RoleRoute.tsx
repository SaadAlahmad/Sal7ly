import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { type User } from "@/types";

interface RoleRouteProps {
  allowedType: "user" | "craftsman" | "admin";
}

const RoleRoute = ({ allowedType }: RoleRouteProps) => {
  const { userType, user } = useAuthStore();

  if (allowedType === "admin") {
    const isAdmin = userType === "user" && (user as User)?.is_admin;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
  }

  if (userType !== allowedType) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default RoleRoute;
