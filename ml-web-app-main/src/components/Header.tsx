"use client"

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const Header: React.FC = () => {
  const { theme } = useTheme();
  
  const bgColor = theme === 'dark' ? 'bg-[#1E222D]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2E39]' : 'border-border-light';
  const textColor = theme === 'dark' ? 'text-[#D1D4DC]' : 'text-blue-600';

  return (
    <header className={`${bgColor} border-b ${borderColor}`}>
      <nav className="max-w px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className={`text-xl font-bold ${textColor}`}>
                MeroLagani
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button className={`${theme === 'dark' ? 'bg-[#2962FF]' : 'bg-blue-600'} text-xs text-white px-4 py-2 rounded-md hover:${theme === 'dark' ? 'bg-[#2962FF]/90' : 'bg-blue-700'}`}>
                Log In
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
