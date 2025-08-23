"use client";

import AccountSettings from "@/components/AccountSettings";
import { useTheme } from "@/context/ThemeContext";

export default function AccountSettingsPage() {
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";

  return (
    <div className={`min-h-screen ${bgColor} flex`}>
      <main className="flex-1 overflow-hidden">
        <AccountSettings />
      </main>
    </div>
  );
}
