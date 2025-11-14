import { useContext } from "react";
import {Navigate} from "react-router-dom";
import { AppContext } from "./AppContext.jsx";
import React from 'react'

const ProtectedRoute = ({children}) => {
    const {token} = useContext(AppContext);
    if (!token) {
        return <Navigate to="/login" replace={true} />
    }
  return children;
}

export default ProtectedRoute