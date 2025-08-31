"use client";

import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { RiUserSettingsLine, RiLockLine, RiNotificationLine, RiShieldLine } from "react-icons/ri";

export default function AccountSettings() {
  const { isSidebarExpanded } = useSidebar();
  const { theme } = useTheme();
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const cardBgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-white";
  const iconColor = theme === "dark" ? "text-gray-300" : "text-gray-700";

  const settingsSections = [
    {
      title: "Profile Settings",
      icon: <RiUserSettingsLine className={`w-5 h-5 ${iconColor}`} />,
      items: [
        { label: "Full Name", value: "John Doe" },
        { label: "Email", value: "john.doe@example.com" },
        { label: "Phone", value: "+1 234 567 890" },
      ],
    },
    {
      title: "Security",
      icon: <RiLockLine className={`w-5 h-5 ${iconColor}`} />,
      items: [
        { label: "Password", value: "••••••••" },
        { label: "Two-Factor Auth", value: "Enabled" },
        { label: "Last Login", value: "2024-03-20 14:30" },
      ],
    },
    {
      title: "Notifications",
      icon: <RiNotificationLine className={`w-5 h-5 ${iconColor}`} />,
      items: [
        { label: "Email Notifications", value: "Enabled" },
        { label: "Push Notifications", value: "Enabled" },
        { label: "SMS Notifications", value: "Disabled" },
      ],
    },
    {
      title: "Privacy",
      icon: <RiShieldLine className={`w-5 h-5 ${iconColor}`} />,
      items: [
        { label: "Profile Visibility", value: "Public" },
        { label: "Data Sharing", value: "Limited" },
        { label: "Activity Status", value: "Visible" },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className="p-4">
        <h1 className={`text-xl font-medium mb-4 ${textColor} lg:hidden`}>Account Settings</h1>
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-2rem)]">
          {/* Left Sidebar - Settings Sections */}
          <div
            className={`w-full lg:w-[390px] lg:min-w-[329px] lg:shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r ${borderColor} p-4 lg:p-6 mb-4 lg:mb-0`}
          >
            <div className="space-y-4 lg:space-y-6">
              {settingsSections.map((section) => (
                <div key={section.title} className={`${cardBgColor} rounded-lg p-4`}>
                  <div className="flex items-center gap-3 mb-4">
                    {section.icon}
                    <h3 className={`text-base font-medium ${textColor}`}>{section.title}</h3>
                  </div>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className={`text-sm ${textColor} opacity-70`}>{item.label}</span>
                        <span className={`text-sm ${textColor} text-right`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-3xl mx-auto">
              <h1 className={`text-xl font-medium mb-6 lg:mb-8 ${textColor} hidden lg:block`}>Account Settings</h1>
              <div className={`${cardBgColor} rounded-lg p-4 lg:p-6`}>
                <h2 className={`text-base font-medium mb-4 lg:mb-6 ${textColor}`}>Edit Profile</h2>
                <form className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className={`block text-sm font-normal mb-2 ${textColor}`}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        defaultValue="John Doe"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-normal mb-2 ${textColor}`}>Email</label>
                      <input
                        type="email"
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        defaultValue="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-normal mb-2 ${textColor}`}>Phone</label>
                      <input
                        type="tel"
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        defaultValue="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-normal mb-2 ${textColor}`}>
                        Location
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        defaultValue="New York, USA"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Activity */}
          <div
            className={`w-full lg:w-[350px] lg:min-w-[329px] lg:shrink-0 overflow-y-auto border-t lg:border-t-0 lg:border-l ${borderColor} p-4 lg:p-6 mt-4 lg:mt-0 lg:block ${
              isSidebarExpanded ? "xl:hidden" : "xl:block"
            }`}
          >
            <div className={`${cardBgColor} rounded-lg p-4`}>
              <h3 className={`text-base font-medium mb-4 ${textColor}`}>Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: "Profile Updated", time: "2 hours ago" },
                  { action: "Password Changed", time: "3 days ago" },
                  { action: "Email Verified", time: "1 week ago" },
                  { action: "Account Created", time: "1 month ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={`text-sm ${textColor} opacity-70`}>{activity.action}</span>
                    <span className={`text-sm ${textColor}`}>{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}