// ProtectedRoute.jsx
import React from "react";
import { useAuth } from "./useAuth";
import ChatbotLogin from "./components/ChatbotLogin";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <ChatbotLogin />;
  }

  return children;
};

export default ProtectedRoute;
