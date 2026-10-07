import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {

    const { user, token } = useAuth();

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
};

export default ProtectedRoute;