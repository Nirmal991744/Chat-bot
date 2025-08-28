import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  LogOut,
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Trash2,
  Download,
  Upload,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth"; // Use the correct import path
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const UserProfile = () => {
  const navigate = useNavigate();
  const {
    user,
    logout,
    isAuthenticated,
    loading: authLoading,
    updateUserProfile,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Simplified user data state focused on user information only
  const [userInfo, setUserInfo] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    location: "",
    bio: "",
    photoURL: null,
    timezone: "Pacific Standard Time",
    language: "English",
    theme: "dark",
    createdAt: "",
  });

  const [editData, setEditData] = useState(userInfo);

  // Check authentication and load user data
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        navigate("/");
      } else {
        loadUserData();
      }
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Load user data from Firebase
  const loadUserData = async () => {
    if (!user) return;

    try {
      // Get additional user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let additionalData = {};
      if (userDocSnap.exists()) {
        additionalData = userDocSnap.data();
      }

      const userData = {
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        phoneNumber: additionalData.phoneNumber || "",
        location: additionalData.location || "",
        bio: additionalData.bio || "",
        photoURL: user.photoURL || null,
        timezone: additionalData.timezone || "Pacific Standard Time",
        language: additionalData.language || "English",
        theme: additionalData.theme || "dark",
        createdAt: user.metadata?.creationTime || new Date().toISOString(),
      };

      setUserInfo(userData);
      setEditData(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Handle save changes
  const handleSave = async () => {
    if (!user) return;

    setUpdateLoading(true);
    try {
      // Update Firebase Auth profile if display name changed
      if (editData.displayName !== userInfo.displayName) {
        await updateUserProfile(editData.displayName, editData.photoURL);
      }

      // Update additional data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userData = {
        displayName: editData.displayName,
        phoneNumber: editData.phoneNumber,
        location: editData.location,
        bio: editData.bio,
        timezone: editData.timezone,
        language: editData.language,
        theme: editData.theme,
        updatedAt: new Date().toISOString(),
      };

      // Check if document exists, create if not
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, {
          ...userData,
          email: user.email,
          createdAt: user.metadata?.creationTime || new Date().toISOString(),
        });
      }

      setUserInfo(editData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
    setUpdateLoading(false);
  };

  const handleCancel = () => {
    setEditData(userInfo);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  // Show loading screen while checking auth state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin" size={32} />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "data", label: "Data", icon: Download },
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar and Basic Info */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
            {userInfo.photoURL ? (
              <img
                src={userInfo.photoURL}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              userInfo.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transition-colors">
              <Camera size={16} />
            </button>
          )}
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {userInfo.displayName}
          </h2>
          <p className="text-gray-400 mb-2">{userInfo.email}</p>
          <p className="text-sm text-gray-500">
            Member since{" "}
            {new Date(userInfo.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Personal Information
          </h3>
          <button
            onClick={() => {
              if (isEditing) {
                handleCancel();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={updateLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            {updateLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : isEditing ? (
              <X size={16} />
            ) : (
              <Edit3 size={16} />
            )}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User size={16} className="inline mr-2" />
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.displayName}
                onChange={(e) =>
                  setEditData({ ...editData, displayName: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userInfo.displayName || "Not provided"}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
              {userInfo.email || "Not provided"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editData.phoneNumber}
                onChange={(e) =>
                  setEditData({ ...editData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userInfo.phoneNumber || "Not provided"}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.location}
                onChange={(e) =>
                  setEditData({ ...editData, location: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userInfo.location || "Not provided"}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            About Me
          </label>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white min-h-[100px]">
              {userInfo.bio || "No bio provided"}
            </p>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={updateLoading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
            >
              {updateLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Account Security
        </h3>

        {/* Account Information */}
        <div className="p-4 bg-gray-800/20 border border-gray-700 rounded-lg mb-6">
          <h4 className="font-medium text-white mb-3">Account Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="text-white font-mono text-xs">{user?.uid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email Verified:</span>
              <span
                className={
                  user?.emailVerified ? "text-green-400" : "text-red-400"
                }
              >
                {user?.emailVerified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account Created:</span>
              <span className="text-white">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Sign In:</span>
              <span className="text-white">
                {user?.metadata?.lastSignInTime
                  ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/20 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Key size={20} className="text-blue-400" />
              <div>
                <h4 className="font-medium text-white">Password Reset</h4>
                <p className="text-sm text-gray-400">
                  Request a password reset email
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/20 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-green-400" />
              <div>
                <h4 className="font-medium text-white">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-400">
                  Add extra security to your account
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Preferences</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Globe size={16} className="inline mr-2" />
              Language
            </label>
            <select
              value={editData.language}
              onChange={(e) =>
                setEditData({ ...editData, language: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Timezone
            </label>
            <select
              value={editData.timezone}
              onChange={(e) =>
                setEditData({ ...editData, timezone: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pacific Standard Time">Pacific (PST)</option>
              <option value="Eastern Standard Time">Eastern (EST)</option>
              <option value="Central Standard Time">Central (CST)</option>
              <option value="Mountain Standard Time">Mountain (MST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Palette size={16} className="inline mr-2" />
              Theme
            </label>
            <select
              value={editData.theme}
              onChange={(e) =>
                setEditData({ ...editData, theme: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={updateLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            {updateLoading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {updateLoading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );

  const DataTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Data Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors">
            <Download size={20} className="text-blue-400" />
            <div className="text-left">
              <h4 className="font-medium text-white">Export Data</h4>
              <p className="text-sm text-gray-400">
                Download your profile data
              </p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors">
            <Trash2 size={20} className="text-red-400" />
            <div className="text-left">
              <h4 className="font-medium text-white">Delete Account</h4>
              <p className="text-sm text-gray-400">
                Permanently delete account
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              User Profile
            </h1>
            <p className="text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200"
            >
              Back to Chat
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "data" && <DataTab />}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
