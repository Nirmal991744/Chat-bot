import React from "react";
import { Route, Routes } from "react-router-dom";
import ChatbotLogin from "./components/ChatbotLogin";
import ChatbotHome from "./components/ChatbotHome";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./ProtectedRoute ";
function App() {
  return (
    <>
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ChatbotHome />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<ChatbotLogin />} />

        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
}

export default App;
App;
