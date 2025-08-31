"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const NewsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"top" | "latest">("top");
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-white";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const buttonBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-[#EFF2F5]";
  const buttonActiveBgColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const borderColor = theme === "dark" ? "border-[#2A2E39]" : "border-border-light";

  return (
    <div className={`${bgColor} p-3 sm:p-4`}>
      {/* Tab Navigation - Responsive */}
      <div className={`relative flex mb-3 sm:mb-4 ${buttonBgColor} rounded-lg p-1`}>
        <button
          onClick={() => setActiveTab("top")}
          className={`relative flex-1 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors duration-300 rounded-md z-10 ${
            activeTab === "top" ? textColor : `${secondaryTextColor} font-medium`
          }`}
        >
          Top
        </button>
        <button
          onClick={() => setActiveTab("latest")}
          className={`relative flex-1 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors duration-300 rounded-md z-10 ${
            activeTab === "latest" ? textColor : `${secondaryTextColor} font-medium`
          }`}
        >
          Latest
        </button>
        {/* Sliding background */}
        <div
          className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] ${buttonActiveBgColor} rounded-md transition-all duration-300 ease-in-out ${
            activeTab === "top" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />
      </div>

      {/* Content - Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {activeTab === "top" ? (
          // Top News Content
          <div className="space-y-3 sm:space-y-4">
            <div className="">
              <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
                {/* Author Info - Responsive */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-xs sm:text-sm ${secondaryTextColor} truncate`}>Ram Bahadhur Panday</p>
                  <p className={`text-10 sm:text-11 font-normal ${secondaryTextColor} flex-shrink-0`}>2 hours ago</p>
                </div>
                {/* News Content - Responsive */}
                <h3 className={`text-xs sm:text-sm font-medium ${textColor} leading-relaxed`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                {/* Image - Responsive */}
                <div className="relative w-full h-32 sm:h-40 mt-2">
                  <Image
                    src="/images/image.jpeg"
                    alt="news image"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
            <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                  <Image
                    src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                    alt="avatar frame"
                    fill
                    className="rounded-full"
                  />
                </div>
                <p className={`text-xs sm:text-sm ${secondaryTextColor} truncate`}>Hari Singh</p>
                <p className={`text-10 sm:text-11 font-normal ${secondaryTextColor} flex-shrink-0`}>2 hours ago</p>
              </div>
              <h3 className={`text-xs sm:text-sm font-medium ${textColor} leading-relaxed`}>
                NBL train is moving, those who want to go to the moon, get on Ride on the DOGEMARS
                train👇👇 👇y gfh hgg
              </h3>
              <div className="relative w-full h-32 sm:h-40 mt-2">
                <Image
                  src="/images/image.jpeg"
                  alt="news image"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          // Latest News Content
          <div className="space-y-3 sm:space-y-4">
            <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                  <Image
                    src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                    alt="avatar frame"
                    fill
                    className="rounded-full"
                  />
                </div>
                <p className={`text-xs sm:text-sm ${secondaryTextColor} truncate`}>Hari Singh</p>
                <p className={`text-10 sm:text-11 font-normal ${secondaryTextColor} flex-shrink-0`}>2 hours ago</p>
              </div>
              <h3 className={`text-xs sm:text-sm font-medium ${textColor} leading-relaxed`}>
                NBL train is moving, those who want to go to the moon, get on Ride on the DOGEMARS
                train👇👇 👇y gfh hgg
              </h3>
              <div className="relative w-full h-32 sm:h-40 mt-2">
                <Image
                  src="/images/image.jpeg"
                  alt="news image"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="">
              <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/2b0fd7d35bbb4c3ea831dea150b907e6.png"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-xs sm:text-sm ${secondaryTextColor} truncate`}>Ram Bahadhur Panday</p>
                  <p className={`text-10 sm:text-11 font-normal ${secondaryTextColor} flex-shrink-0`}>2 hours ago</p>
                </div>
                <h3 className={`text-xs sm:text-sm font-medium ${textColor} leading-relaxed`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                <div className="relative w-full h-32 sm:h-40 mt-2">
                  <Image
                    src="/images/image.jpeg"
                    alt="news image"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="">
              <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/2b0fd7d35bbb4c3ea831dea150b907e6.png"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-xs sm:text-sm ${secondaryTextColor} truncate`}>Ram Bahadhur Panday</p>
                  <p className={`text-10 sm:text-11 font-normal ${secondaryTextColor} flex-shrink-0`}>2 hours ago</p>
                </div>
                <h3 className={`text-xs sm:text-sm font-medium ${textColor} leading-relaxed`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                <div className="relative w-full h-32 sm:h-40 mt-2">
                  <Image
                    src="/images/image.jpeg"
                    alt="news image"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSection;