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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatbotHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  function handleLogout() {
    navigate("/");
  }
  function profileHandler() {
    navigate("/profile");
  }
  // Sample chat data - in real app, this would come from API/database
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
        {
          id: 2,
          text: "I need help with understanding AI concepts",
          isBot: false,
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          id: 3,
          text: "I'd be happy to help explain AI concepts! What specific area would you like to explore?",
          isBot: true,
          timestamp: new Date(Date.now() - 3400000),
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

  const sendMessage = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: new Date(),
    };

    // Add user message
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, newUserMessage],
              lastMessage: message,
              timestamp: new Date().toISOString(),
            }
          : chat
      )
    );

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse(message),
        isBot: true,
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, botResponse],
                lastMessage: botResponse.text,
              }
            : chat
        )
      );
    }, 1000);

    setMessage("");
  };

  const generateBotResponse = (userMessage) => {
    const responses = [
      "That's a great question! Let me help you with that.",
      "I understand what you're asking. Here's what I think...",
      "Thanks for sharing that. Based on what you've said...",
      "That's an interesting point. Let me provide some insights.",
      "I'd be happy to help you explore this further.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Conversation",
      lastMessage: "Start a new conversation",
      timestamp: new Date().toISOString(),
      messages: [],
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
                <p className="text-gray-400 text-sm">AI Assistant</p>
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
                  <p className="text-sm lg:text-base">{msg.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
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
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 lg:py-4 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send size={16} />
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
