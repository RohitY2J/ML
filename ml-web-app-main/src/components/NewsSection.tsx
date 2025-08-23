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
    <div className={`${bgColor} p-4`}>
      {/* Tab Navigation */}
      <div className={`relative flex mb-4 ${buttonBgColor} rounded-lg p-1`}>
        <button
          onClick={() => setActiveTab("top")}
          className={`relative flex-1 py-2 text-sm text-xs transition-colors duration-300 rounded-md z-10 ${
            activeTab === "top" ? textColor : `${secondaryTextColor} font-medium`
          }`}
        >
          Top
        </button>
        <button
          onClick={() => setActiveTab("latest")}
          className={`relative flex-1 py-2 text-sm text-xs transition-colors duration-300 rounded-md z-10 ${
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

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "top" ? (
          // Top News Content
          <div className="space-y-4">
            <div className="">
              <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-sm ${secondaryTextColor}`}>Ram Bahadhur Panday</p>
                  <p className={`text-11 font-normal ${secondaryTextColor}`}>2 hours ago</p>
                </div>
                <h3 className={`text-sm font-medium ${textColor}`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                <div className="relative w-full h-40 mt-2">
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
              <div className="flex items-center gap-2 mb-2">
                <div className="relative w-6 h-6">
                  <Image
                    src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                    alt="avatar frame"
                    fill
                    className="rounded-full"
                  />
                </div>
                <p className={`text-sm ${secondaryTextColor}`}>Hari Singh</p>
                <p className={`text-11 font-normal ${secondaryTextColor}`}>2 hours ago</p>
              </div>
              <h3 className={`text-sm font-medium ${textColor}`}>
                NBL train is moving, those who want to go to the moon, get on Ride on the DOGEMARS
                train👇👇 👇y gfh hgg
              </h3>
              <div className="relative w-full h-40 mt-2">
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
          <div className="space-y-4">
            <div className={`px-1 transition-colors border-b pb-3 ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative w-6 h-6">
                  <Image
                    src="https://s3.coinmarketcap.com/static-gravity/image/fba756c012164c6c9d23f93906d30875.jpg"
                    alt="avatar frame"
                    fill
                    className="rounded-full"
                  />
                </div>
                <p className={`text-sm ${secondaryTextColor}`}>Hari Singh</p>
                <p className={`text-11 font-normal ${secondaryTextColor}`}>2 hours ago</p>
              </div>
              <h3 className={`text-sm font-medium ${textColor}`}>
                NBL train is moving, those who want to go to the moon, get on Ride on the DOGEMARS
                train👇👇 👇y gfh hgg
              </h3>
              <div className="relative w-full h-40 mt-2">
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
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/2b0fd7d35bbb4c3ea831dea150b907e6.png"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-sm ${secondaryTextColor}`}>Ram Bahadhur Panday</p>
                  <p className={`text-11 font-normal ${secondaryTextColor}`}>2 hours ago</p>
                </div>
                <h3 className={`text-sm font-medium ${textColor}`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                <div className="relative w-full h-40 mt-2">
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
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-6 h-6">
                    <Image
                      src="https://s3.coinmarketcap.com/static-gravity/image/2b0fd7d35bbb4c3ea831dea150b907e6.png"
                      alt="avatar frame"
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p className={`text-sm ${secondaryTextColor}`}>Ram Bahadhur Panday</p>
                  <p className={`text-11 font-normal ${secondaryTextColor}`}>2 hours ago</p>
                </div>
                <h3 className={`text-sm font-medium ${textColor}`}>
                  🧠 3.7M votes — and 81% are bullish on NBL. <br />
                  Sentiment is loud. <br />
                  But remember: euphoria ≠ breakout. <br />
                  Watch the NPR 86K level{" "}
                </h3>
                <div className="relative w-full h-40 mt-2">
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
