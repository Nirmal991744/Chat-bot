import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./useAuth";
import ChatbotLogin from "./components/ChatbotLogin";
import ChatbotHome from "./components/ChatbotHome";
import ProtectedRoute from "./ProtectedRoute ";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ChatbotLogin />} />
          <Route path="/login" element={<ChatbotLogin />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <ChatbotHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
