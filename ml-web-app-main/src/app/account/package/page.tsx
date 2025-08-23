"use client";

import PackageDetails from "@/components/PackageDetails";
import { useTheme } from "@/context/ThemeContext";

export default function PackageDetailsPage() {
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";

  return (
    <div className={`min-h-screen ${bgColor} flex`}>
      <main className="flex-1 overflow-hidden">
        <PackageDetails />
      </main>
    </div>
  );
}
