import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  Menu,
  X,
  MessageCircle,
  Trash2,
  Edit3,
  User,
  Bot,
  Settings,
  LogOut,
  Search,
  MoreVertical,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatbotHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  function handleLogout() {
    navigate("/");
  }

  function profileHandler() {
    navigate("/profile");
  }

  const [chats, setChats] = useState([
    {
      id: 1,
      title: "Getting Started with AI",
      lastMessage: "How can I help you today?",
      timestamp: new Date().toISOString(),
      messages: [
        {
          id: 1,
          text: "Hello! How can I help you today?",
          isBot: true,
          timestamp: new Date(Date.now() - 3600000),
        },
      ],
    },
    {
      id: 2,
      title: "React Development Tips",
      lastMessage: "Great question about hooks!",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      messages: [
        {
          id: 1,
          text: "Can you help me with React hooks?",
          isBot: false,
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: 2,
          text: "Absolutely! React hooks are functions that let you use state and other React features. Which hook would you like to learn about?",
          isBot: true,
          timestamp: new Date(Date.now() - 86300000),
        },
      ],
    },
    {
      id: 3,
      title: "JavaScript Best Practices",
      lastMessage: "Here are some key principles...",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      messages: [
        {
          id: 1,
          text: "What are JavaScript best practices?",
          isBot: false,
          timestamp: new Date(Date.now() - 172800000),
        },
        {
          id: 2,
          text: "Here are some key JavaScript best practices: Use const/let instead of var, write clean and readable code, handle errors properly...",
          isBot: true,
          timestamp: new Date(Date.now() - 172700000),
        },
      ],
    },
  ]);

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // API call function
  const sendToAPI = async (userMessage) => {
    try {
      console.log("Sending message:", userMessage);

      const res = await fetch("/webhook-test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msg: userMessage,
        }),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log("Response data:", data);

        // Extract the actual message from the response
        // Adjust this based on your API response structure
        return (
          data.message || data.response || data.text || JSON.stringify(data)
        );
      } else {
        const text = await res.text();
        console.log("Response text:", text);
        return text;
      }
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error details:", err.message);

      // Return error message to display to user
      if (err.message.includes("Failed to fetch")) {
        return "Sorry, I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  // Main send message function
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage(""); // Clear input immediately
    setIsLoading(true);

    // Create user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };

    // Add user message to chat
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, newUserMessage],
              lastMessage: userMessage,
              timestamp: new Date().toISOString(),
            }
          : chat
      )
    );

    try {
      // Get response from API
      const botResponseText = await sendToAPI(userMessage);

      // Create bot message
      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
      };

      // Add bot response to chat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, botResponse],
                lastMessage:
                  botResponseText.length > 50
                    ? botResponseText.substring(0, 50) + "..."
                    : botResponseText,
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error in sendMessage:", error);

      // Add error message as bot response
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your message. Please try again.",
        isBot: true,
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorResponse],
                lastMessage: errorResponse.text,
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Conversation",
      lastMessage: "Start a new conversation",
      timestamp: new Date().toISOString(),
      messages: [
        {
          id: 1,
          text: "Hello! How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ],
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (chatId === currentChatId && chats.length > 1) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remainingChats[0].id);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 w-80 h-full bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 z-50 transition-transform duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Chatbot</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={20} />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setIsSidebarOpen(false);
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                currentChatId === chat.id
                  ? "bg-blue-600/20 border border-blue-500/30"
                  : "hover:bg-gray-800/50 border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate mb-1">{chat.title}</h3>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-400">john@example.com</p>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">
                  {currentChat?.title || "Select a chat"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {isLoading ? "AI is typing..." : "AI Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={profileHandler}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-red-400"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {currentChat?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.isBot ? "" : "flex-row-reverse"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.isBot
                    ? "bg-gradient-to-br from-blue-500 to-purple-600"
                    : "bg-gradient-to-br from-green-500 to-blue-500"
                }`}
              >
                {msg.isBot ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  msg.isBot ? "" : "text-right"
                }`}
              >
                <div
                  className={`p-3 lg:p-4 rounded-2xl ${
                    msg.isBot
                      ? "bg-gray-800/50 border border-gray-700"
                      : "bg-blue-600/20 border border-blue-500/30"
                  }`}
                >
                  <p className="text-sm lg:text-base whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
                <Bot size={16} />
              </div>
              <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                <div className="p-3 lg:p-4 rounded-2xl bg-gray-800/50 border border-gray-700">
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin" size={16} />
                    <p className="text-sm lg:text-base">Thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isLoading ? "Please wait..." : "Type your message..."
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 lg:py-4 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • AI can make mistakes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotHome;
