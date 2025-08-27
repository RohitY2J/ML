"use client";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";

// User Management Component
export const UserManagement = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [users, setUsers] = useState([
    { id: 1, email: "user1@example.com", role: "admin" },
    { id: 2, email: "user2@example.com", role: "user" },
  ]);

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const inputBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";
  const cardBg = theme === "dark" ? "bg-[#1A1D29]" : "bg-gray-50";

  const handleAddUser = () => {
    if (email) {
      setUsers([...users, { id: Date.now(), email, role }]);
      setEmail("");
      setRole("user");
    }
  };

  return (
    <div className={`p-6 ${bgColor} h-full`}>
      <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>User Management</h2>

      {/* Add User Form */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor} mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Add New User</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`} />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`p-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <button
            onClick={handleAddUser}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className={`${cardBg} p-4 rounded-lg border ${borderColor}`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Existing Users</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${borderColor}`}
            >
              <div>
                <span className={`${textColor} font-medium`}>{user.email}</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "moderator"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"}`}
                >
                  {user.role}
                </span>
              </div>
              <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
