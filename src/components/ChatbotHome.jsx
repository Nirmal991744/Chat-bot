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
import { useAuth } from "../useAuth";
import OpenAI from "openai";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const ChatbotHome = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [hasCreatedInitialChat, setHasCreatedInitialChat] = useState(false);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();

  // Initialize OpenAI with your API key
  const openai = new OpenAI({
    apiKey:
      "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",
    dangerouslyAllowBrowser: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load chats from Firestore - FIXED: Simplified query to avoid index requirement
  useEffect(() => {
    if (!user) return;

    setChatsLoading(true);

    // First, try the simple query without ordering to avoid index issues
    const q = query(collection(db, "chats"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const chatsData = [];
        querySnapshot.forEach((doc) => {
          chatsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort in JavaScript instead of Firestore to avoid index requirement
        chatsData.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        );

        console.log("Loaded chats:", chatsData);
        setChats(chatsData);
        setChatsLoading(false);

        // Set current chat if none selected and chats exist
        if (!currentChatId && chatsData.length > 0) {
          setCurrentChatId(chatsData[0].id);
        }
      },
      (error) => {
        console.error("Error loading chats:", error);
        setChatsLoading(false);

        // If we still get an index error, we'll need to create the index
        if (error.code === "failed-precondition") {
          console.error(
            "Index required. Please create the index using the URL in the error message above."
          );
        }
      }
    );

    return () => unsubscribe();
  }, [user, currentChatId]);

  // Create initial chat on login (only once per session)
  useEffect(() => {
    if (user && !chatsLoading && chats.length === 0 && !hasCreatedInitialChat) {
      createInitialChat();
      setHasCreatedInitialChat(true);
    }
  }, [user, chats.length, chatsLoading, hasCreatedInitialChat]);

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

  // Create initial chat on login (empty chat, first response comes from OpenAI)
  const createInitialChat = async () => {
    if (!user) return;

    try {
      const newChat = {
        title: "New Conversation",
        userId: user.uid,
        messages: [],
        lastMessage: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "chats"), newChat);
      setCurrentChatId(docRef.id);
      console.log("Initial chat created successfully");
    } catch (error) {
      console.error("Error creating initial chat:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Reset state on logout
      setChats([]);
      setCurrentChatId(null);
      setHasCreatedInitialChat(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  function profileHandler() {
    navigate("/profile");
  }

  // OpenAI API call
  const aiCall = async (prompt, conversationHistory = []) => {
    try {
      console.log("Sending message to OpenAI:", prompt);

      // Prepare messages for OpenAI with system context and conversation history
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful, knowledgeable, and friendly AI assistant. Provide accurate, informative, and engaging responses. Be conversational but professional. If you're unsure about something, acknowledge it honestly.",
        },
        // Add recent conversation history (last 10 messages for context)
        ...conversationHistory.slice(-10).map((msg) => ({
          role: msg.isBot ? "assistant" : "user",
          content: msg.text,
        })),
        // Add current user message
        {
          role: "user",
          content: prompt,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response received from OpenAI");
      }

      console.log("OpenAI response received successfully");
      return response;
    } catch (error) {
      console.error("Error calling OpenAI:", error);

      // Provide specific error messages based on error type
      if (error.status === 401) {
        return "I apologize, but there's an authentication issue with the AI service. Please check the API configuration.";
      } else if (error.status === 429) {
        return "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (error.status === 500) {
        return "The AI service is currently experiencing issues. Please try again in a few moments.";
      } else if (
        error.name === "NetworkError" ||
        error.message.includes("fetch")
      ) {
        return "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      } else {
        return "I encountered an unexpected error. Please try rephrasing your message or try again later.";
      }
    }
  };

  // FIXED: Enhanced send message function with better error handling
  const sendMessage = async () => {
    if (!message.trim() || isLoading || !currentChatId) {
      console.log("Cannot send message:", {
        message: message.trim(),
        isLoading,
        currentChatId,
      });
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    console.log("Sending message:", userMessage);
    console.log("Current chat ID:", currentChatId);

    // Create user message
    const newUserMessage = {
      id: `user_${Date.now()}`,
      text: userMessage,
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Get current messages
      const currentMessages = currentChat?.messages || [];
      console.log("Current messages before update:", currentMessages);

      const updatedMessages = [...currentMessages, newUserMessage];
      console.log("Updated messages with user message:", updatedMessages);

      // Update chat with user message immediately for better UX
      console.log("Updating Firestore with user message...");
      const updateData = {
        messages: updatedMessages,
        lastMessage: userMessage,
        updatedAt: new Date().toISOString(),
      };

      // Update chat title if it's the first user message
      if (currentMessages.length === 0) {
        updateData.title =
          userMessage.length > 50
            ? userMessage.substring(0, 50) + "..."
            : userMessage;
      }

      await updateDoc(doc(db, "chats", currentChatId), updateData);
      console.log("Firestore updated with user message");

      // Get response from OpenAI
      console.log("Calling OpenAI...");
      const botResponseText = await aiCall(userMessage, currentMessages);
      console.log("OpenAI response:", botResponseText);

      // Create bot message
      const botResponse = {
        id: `bot_${Date.now()}`,
        text: botResponseText,
        isBot: true,
        timestamp: new Date().toISOString(),
      };

      // Update chat with bot response
      const finalMessages = [...updatedMessages, botResponse];
      console.log("Final messages with bot response:", finalMessages);

      console.log("Updating Firestore with bot response...");
      await updateDoc(doc(db, "chats", currentChatId), {
        messages: finalMessages,
        lastMessage:
          botResponseText.length > 50
            ? botResponseText.substring(0, 50) + "..."
            : botResponseText,
        updatedAt: new Date().toISOString(),
      });
      console.log("Firestore updated with bot response");
    } catch (error) {
      console.error("Error in sendMessage:", error);

      // Add error message as bot response
      const errorResponse = {
        id: `error_${Date.now()}`,
        text: "I apologize, but I encountered an error processing your message. Please try again, or if the problem persists, try creating a new chat.",
        isBot: true,
        timestamp: new Date().toISOString(),
      };

      try {
        const currentMessages = currentChat?.messages || [];
        const errorMessages = [
          ...currentMessages,
          newUserMessage,
          errorResponse,
        ];

        await updateDoc(doc(db, "chats", currentChatId), {
          messages: errorMessages,
          lastMessage: errorResponse.text,
          updatedAt: new Date().toISOString(),
        });
        console.log("Error message added to Firestore");
      } catch (updateError) {
        console.error("Error updating chat with error message:", updateError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced create new chat function
  const createNewChat = async () => {
    if (!user) return;

    try {
      const newChat = {
        title: "New Conversation",
        userId: user.uid,
        messages: [],
        lastMessage: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "chats"), newChat);
      setCurrentChatId(docRef.id);
      setIsSidebarOpen(false);
      console.log("New chat created successfully");
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat. Please try again.");
    }
  };

  const deleteChat = async (chatId) => {
    if (chats.length === 1) {
      alert("You cannot delete your last chat. Create a new chat first.");
      return;
    }

    try {
      await deleteDoc(doc(db, "chats", chatId));

      // If we're deleting the current chat, switch to another one
      if (chatId === currentChatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
        }
      }
      console.log("Chat deleted successfully");
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
            <h2 className="text-2xl font-bold">AI Chat</h2>
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
                {searchQuery
                  ? "No chats match your search"
                  : "Creating your first chat..."}
              </p>
              {!searchQuery && (
                <p className="text-sm text-center mt-2">
                  Your AI assistant is getting ready
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
                      {new Date(
                        chat.updatedAt || chat.createdAt
                      ).toLocaleDateString()}
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
              <p className="font-medium">
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </p>
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
                  {currentChat?.title || "AI Chat"}
                </h1>
                <p className="text-gray-400 text-sm">
                  {isLoading
                    ? "AI is typing..."
                    : "Powered by OpenAI GPT-4o-mini"}
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
                Setting up your AI Assistant
              </h2>
              <p className="text-center max-w-md">
                Your personalized AI chat is being prepared...
              </p>
            </div>
          ) : (
            <>
              {currentChat?.messages?.length > 0 ? (
                currentChat.messages.map((msg) => (
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={48} className="mb-4 opacity-50" />
                  <h2 className="text-xl font-semibold mb-2">
                    Start a conversation
                  </h2>
                  <p className="text-center">
                    Send a message to begin chatting with your AI assistant
                  </p>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot size={16} />
                  </div>
                  <div className="max-w-xs lg:max-w-md xl:max-lg">
                    <div className="p-3 lg:p-4 rounded-2xl bg-gray-800/50 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin" size={16} />
                        <p className="text-sm lg:text-base">
                          AI is thinking...
                        </p>
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
                      ? "Setting up chat..."
                      : isLoading
                      ? "AI is responding..."
                      : "Ask me anything..."
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
              Press Enter to send • Powered by OpenAI GPT-4o-mini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotHome;
