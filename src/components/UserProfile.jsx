import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  function logoutHandler() {
    navigate("/");
  }
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "2023-06-15",
    bio: "AI enthusiast and software developer passionate about creating innovative solutions.",
    avatar: null,
    timezone: "Pacific Standard Time",
    language: "English",
    theme: "dark",
  });

  const [editData, setEditData] = useState(userData);

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In a real app, this would clear tokens, redirect to login, etc.
    console.log("Logging out...");
    setShowLogoutModal(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transition-colors">
            <Camera size={16} />
          </button>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {userData.name}
          </h2>
          <p className="text-gray-400 mb-2">{userData.email}</p>
          <p className="text-sm text-gray-500">
            Member since{" "}
            {new Date(userData.joinDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Personal Information
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Edit3 size={16} />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User size={16} className="inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userData.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userData.email}
              </p>
            )}
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
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userData.phone}
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
              />
            ) : (
              <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
                {userData.location}
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
            <p className="px-4 py-3 bg-gray-800/20 border border-gray-700 rounded-lg text-white">
              {userData.bio}
            </p>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancel
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
          Security Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/20 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Key size={20} className="text-blue-400" />
              <div>
                <h4 className="font-medium text-white">Change Password</h4>
                <p className="text-sm text-gray-400">
                  Update your password regularly
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Change
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
                  Add an extra layer of security
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
            <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Timezone
            </label>
            <select className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="PST">Pacific Standard Time</option>
              <option value="EST">Eastern Standard Time</option>
              <option value="CST">Central Standard Time</option>
              <option value="MST">Mountain Standard Time</option>
            </select>
          </div>
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
              Profile Settings
            </h1>
            <p className="text-gray-400">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <LogOut size={20} />
            Logout
          </button>
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
          {activeTab === "notifications" && (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Notification Settings
              </h3>
              <p className="text-gray-400">
                Notification settings coming soon...
              </p>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Data Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors">
              <Download size={20} className="text-blue-400" />
              <div className="text-left">
                <h4 className="font-medium text-white">Export Data</h4>
                <p className="text-sm text-gray-400">Download your data</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors">
              <Upload size={20} className="text-green-400" />
              <div className="text-left">
                <h4 className="font-medium text-white">Import Data</h4>
                <p className="text-sm text-gray-400">Upload your data</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors">
              <Trash2 size={20} className="text-red-400" />
              <div className="text-left">
                <h4 className="font-medium text-white">Delete Account</h4>
                <p className="text-sm text-gray-400">Permanently delete</p>
              </div>
            </button>
          </div>
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
