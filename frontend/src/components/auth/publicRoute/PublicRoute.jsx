import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import FullPageFeedback from "../../feedback/FullPageFeedback";

function PublicRoute()
{
   const { isAuthenticated, loading } = useAuth();

   if(loading)
      return <FullPageFeedback>Loading your account...</FullPageFeedback>;

   if(isAuthenticated)
      return <Navigate to="/dashboard" replace />;

   return <Outlet />;
}

export default PublicRoute;
