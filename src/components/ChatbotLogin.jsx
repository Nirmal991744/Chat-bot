import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Github, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatbotLogin = () => {
  const navigate = useNavigate();
  function loginHandler() {
    navigate("/home");
  }
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orb */}
      <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-pink-500 opacity-80 blur-3xl animate-pulse"></div>
      </div>

      {/* Additional floating orbs for depth */}
      <div className="absolute right-1/3 top-1/3">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-40 blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute left-1/2 bottom-1/4">
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-pink-400 to-red-500 opacity-30 blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Chatbot
            </h1>
            <p className="text-gray-400 text-lg">await chatbot</p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Sign In Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={loginHandler}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </button>
              <button
                onClick={loginHandler}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Sign Up
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group">
                <Github className="h-5 w-5 group-hover:scale-110 transition-transform" />
                See Repository
              </button>

              <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group">
                <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                View Snapshots
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotLogin;
