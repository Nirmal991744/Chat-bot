import React from "react";
import { Route, Routes } from "react-router-dom";
import ChatbotLogin from "./components/ChatbotLogin";
import ChatbotHome from "./components/ChatbotHome";
import UserProfile from "./components/UserProfile";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ChatbotLogin />} />
        <Route path="/home" element={<ChatbotHome />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </>
  );
}

export default App;
App;
