import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import FullPageFeedback from "../../feedback/FullPageFeedback";

function ProtectedRoute()
{
   const { isAuthenticated, loading } = useAuth();

   if(loading)
      return <FullPageFeedback>Loading your account...</FullPageFeedback>;

   if(!isAuthenticated)
      return <Navigate to="/login" replace />;

   return <Outlet />;
}

export default ProtectedRoute;
