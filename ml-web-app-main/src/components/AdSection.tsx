"use client"

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

const AdSection: React.FC = () => {
  const { theme } = useTheme();
  
  const bgColor = theme === 'dark' ? 'bg-[#2A2E39]' : 'bg-[#F8FAFD]';
  const textColor = theme === 'dark' ? 'text-[#9598A1]' : 'text-gray-500';
  const adBgColor = theme === 'dark' ? 'bg-[#1E222D]' : 'bg-gray-200';

  return (
    <div className={`${bgColor} p-4 mt-4`}>
      <div className={`text-center ${textColor} text-sm mb-2`}>Advertisement</div>
      <div className={`${adBgColor} rounded-lg overflow-hidden relative h-[250px]`}>
        <Image
          src="/images/ad.jpeg"
          alt="Advertisement"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default AdSection; 