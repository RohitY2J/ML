import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import {
  RiDashboardLine,
  RiUserSettingsLine,
  RiPagesLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMenuLine,
  RiBookmarkLine,
} from "react-icons/ri";

// Theme toggle icons
const SunIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Menu",
    icon: <RiMenuLine className="w-5 h-5" />,
    path: "",
    subItems: [
      {
        title: "Dashboard",
        icon: <RiDashboardLine className="w-5 h-5" />,
        path: "/dashboard",
      },
      {
        title: "Watchlist",
        icon: <RiBookmarkLine className="w-5 h-5" />,
        path: "/watchlist",
      },
    ],
  },
  {
    title: "Account",
    icon: <RiUserSettingsLine className="w-5 h-5" />,
    path: "",
    subItems: [
      {
        title: "Account Settings",
        icon: <RiUserSettingsLine className="w-5 h-5" />,
        path: "/account/settings",
      },
      {
        title: "Package Details",
        icon: <RiPagesLine className="w-5 h-5" />,
        path: "/account/package",
      },
    ],
  },
];

interface SidebarProps {
  onCollapseChange: (isCollapsed: boolean) => void;
  onPathChange: (path: string) => void;
  selectedPath: string;
}

export default function Sidebar({ onCollapseChange, onPathChange, selectedPath }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const hoverBgColor = theme === "dark" ? "hover:bg-dark-light" : "hover:bg-gray-100";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange(!newState);
  };

  const handlePathChange = (path: string) => {
    onPathChange(path);
    router.push(path);
  };

  return (
    <div
      className={`${bgColor} h-screen ${
        isCollapsed ? "w-20" : "w-60"
      } transition-all duration-300 border-r ${borderColor} flex flex-col`}
    >
      {/* Logo Section */}
      <div className={`p-4 border-b ${borderColor}`}>
        <div className="flex items-center justify-center">
          {!isCollapsed ? (
            <Link href="/" className={`text-lg font-semibold ${textColor}`}>
              MeroLagani
            </Link>
          ) : (
            <Link href="/" className={`text-lg font-semibold ${textColor}`}>
              ML
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.title}>
            <div className={`px-4 py-2 ${textColor} text-sm font-medium opacity-70`}>
              {!isCollapsed && item.title}
            </div>
            {item.subItems?.map((subItem) => (
              <button
                key={subItem.title}
                onClick={() => handlePathChange(subItem.path)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center" : ""
                } px-4 py-2.5 ${hoverBgColor} ${textColor} ${
                  selectedPath === subItem.path ? "bg-opacity-10 font-medium" : "font-normal"
                }`}
              >
                <span className="flex-shrink-0">{subItem.icon}</span>
                {!isCollapsed && <span className="ml-3 text-sm">{subItem.title}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${borderColor}`}>
        <button
          onClick={toggleTheme}
          className={`w-full p-2 rounded-lg ${hoverBgColor} ${textColor} transition-colors duration-200 flex items-center ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          aria-label="Toggle theme"
        >
          <span className="flex-shrink-0">{theme === "dark" ? <SunIcon /> : <MoonIcon />}</span>
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </div>

      {/* Collapse Button at Bottom */}
      <div className={`p-4 border-t ${borderColor}`}>
        <button
          onClick={handleCollapse}
          className={`w-full flex items-center justify-center p-2 rounded-lg ${hoverBgColor} ${textColor}`}
        >
          {isCollapsed ? (
            <RiMenuUnfoldLine className="w-5 h-5" />
          ) : (
            <RiMenuFoldLine className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
