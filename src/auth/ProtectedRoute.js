import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({
    component: Component,
    path
}
) => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    return isLoggedIn ? <Component  /> : <Navigate to={path} replace />;
};
export default PrivateRoute;