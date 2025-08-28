import React from "react";
import { useAuth } from "./useAuth";
import ChatbotLogin from "./components/ChatbotLogin";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-white" size={32} />
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <ChatbotLogin />;
  }

  return children;
};

export default ProtectedRoute;
