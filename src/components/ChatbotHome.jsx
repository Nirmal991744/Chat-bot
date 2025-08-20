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
import { useAuth } from "../useAuth"; // Adjust path as needed
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// Initialize Firestore
const db = getFirestore();

const ChatbotHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [chats, setChats] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Load user's chats from Firestore
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        setChatsLoading(true);
        const chatsRef = collection(db, "chats");
        const q = query(
          chatsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userChats = [];
          snapshot.forEach((doc) => {
            userChats.push({ id: doc.id, ...doc.data() });
          });

          setChats(userChats);

          // If no current chat selected and we have chats, select the first one
          if (!currentChatId && userChats.length > 0) {
            setCurrentChatId(userChats[0].id);
          }

          setChatsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading chats:", error);
        setChatsLoading(false);
      }
    };

    loadChats();
  }, [user, currentChatId]);

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

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  function profileHandler() {
    navigate("/profile");
  }

  // API call function
  const sendToAPI = async (userMessage) => {
    try {
      console.log("Sending message:", userMessage);

      const res = await fetch("/webhook/chat", {
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

      if (err.message.includes("Failed to fetch")) {
        return "Sorry, I'm having trouble connecting to the server. Please check your internet connection and try again.";
      }
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  // Main send message function
  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentChatId) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    // Create user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      isBot: false,
      timestamp: new Date(),
    };

    try {
      // Update local state immediately
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...(chat.messages || []), newUserMessage],
                lastMessage: userMessage,
                timestamp: new Date().toISOString(),
              }
            : chat
        )
      );

      // Update Firestore
      const chatRef = doc(db, "chats", currentChatId);
      const currentChatData = chats.find((chat) => chat.id === currentChatId);
      await updateDoc(chatRef, {
        messages: [...(currentChatData?.messages || []), newUserMessage],
        lastMessage: userMessage,
        timestamp: new Date().toISOString(),
      });

      // Get response from API
      const botResponseText = await sendToAPI(userMessage);

      // Create bot message
      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
      };

      // Update local state with bot response
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...(chat.messages || []), botResponse],
                lastMessage:
                  botResponseText.length > 50
                    ? botResponseText.substring(0, 50) + "..."
                    : botResponseText,
              }
            : chat
        )
      );

      // Update Firestore with bot response
      const updatedChatData = chats.find((chat) => chat.id === currentChatId);
      await updateDoc(chatRef, {
        messages: [...(updatedChatData?.messages || []), botResponse],
        lastMessage:
          botResponseText.length > 50
            ? botResponseText.substring(0, 50) + "..."
            : botResponseText,
      });
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
                messages: [...(chat.messages || []), errorResponse],
                lastMessage: errorResponse.text,
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    try {
      const newChat = {
        title: "New Conversation",
        lastMessage: "Start a new conversation",
        timestamp: new Date().toISOString(),
        userId: user.uid,
        messages: [
          {
            id: 1,
            text: "Hello! How can I help you today?",
            isBot: true,
            timestamp: new Date(),
          },
        ],
      };

      const docRef = await addDoc(collection(db, "chats"), newChat);

      // Update local state
      const chatWithId = { id: docRef.id, ...newChat };
      setChats([chatWithId, ...chats]);
      setCurrentChatId(docRef.id);
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat. Please try again.");
    }
  };

  const deleteChat = async (chatId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "chats", chatId));

      // Update local state
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setChats(remainingChats);

      // If we're deleting the current chat, switch to another one
      if (chatId === currentChatId) {
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
        } else {
          setCurrentChatId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin" size={32} />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
          {chatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin" size={24} />
                <p className="text-gray-400 text-sm">Loading chats...</p>
              </div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <MessageCircle size={48} className="mb-4 opacity-50" />
              <p className="text-center">
                {searchQuery ? "No chats match your search" : "No chats yet"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-center mt-2">
                  Click "New Chat" to start your first conversation
                </p>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
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
            ))
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.displayName || "User"}</p>
              <p className="text-sm text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={profileHandler}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
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
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
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
          {!currentChat ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bot size={64} className="mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to AI Chat
              </h2>
              <p className="text-center max-w-md">
                Select a chat from the sidebar or create a new conversation to
                get started
              </p>
            </div>
          ) : (
            <>
              {currentChat?.messages?.map((msg) => (
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
              )) || []}

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
            </>
          )}
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
                    !currentChat
                      ? "Select or create a chat to start messaging..."
                      : isLoading
                      ? "Please wait..."
                      : "Type your message..."
                  }
                  disabled={isLoading || !currentChat}
                  className="w-full px-4 py-3 lg:py-4 pr-12 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading || !currentChat}
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
