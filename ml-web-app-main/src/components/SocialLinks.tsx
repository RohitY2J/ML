"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

const SocialLinks: React.FC = () => {
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-gray-200";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const linkBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-gray-100";
  const linkTextColor = theme === "dark" ? "text-[#D1D4DC]" : "text-black-100";

  return (
    <div className={`${bgColor} p-4 border-t ${borderColor}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Labels Column */}
        <div className="space-y-4">
          <div className="h-6">
            <h3 className={`text-xs font-medium ${secondaryTextColor}`}>Website</h3>
          </div>
          <div className="h-6">
            <h3 className={`text-xs font-medium ${secondaryTextColor}`}>Social</h3>
          </div>
          <div className="h-6">
            <h3 className={`text-xs font-medium ${secondaryTextColor}`}>Rating</h3>
          </div>
        </div>

        {/* Values Column */}
        <div className="space-y-4">
          <div className="h-6 flex justify-end">
            {/* TODO: use search params change to add href = https://{searchParams}.com */}
            <a
              href="https://bitcoin.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline"
            >
              <span
                className={`${linkBgColor} ${linkTextColor} font-medium px-3 py-1 rounded-full`}
              >
                https://nepalstock.com/
              </span>
            </a>
          </div>
          <div className="space-y-1 flex justify-end gap-2">
            <a
              href="https://reddit.com/r/bitcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs block flex justify-end"
            >
              <span className={`${linkBgColor} px-2 py-1 rounded-full flex items-center`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#FF4500">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
              </span>
            </a>
            <a
              href="https://github.com/bitcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs block flex justify-end"
            >
              <span className={`${linkBgColor} px-2 py-1 rounded-full flex items-center`}>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill={theme === "dark" ? "#D1D4DC" : "#000000"}
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </span>
            </a>
          </div>
          <div className="h-6 flex justify-end">
            <div className="flex items-center">
              <span
                className={`${linkBgColor} px-2 py-1 rounded-full text-xs font-medium ${linkTextColor}`}
              >
                4.8
              </span>
              <div className="ml-2 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${
                      i < 4
                        ? "text-yellow-400"
                        : theme === "dark"
                        ? "text-[#2A2E39]"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
