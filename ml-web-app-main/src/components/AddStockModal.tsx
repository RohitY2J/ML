"use client"

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { RiCloseLine } from 'react-icons/ri';

export interface Stocks{
  symbol: string,
  name: ""
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stock: string) => void;
  stocks: Stocks[];
}



export default function AddStockModal({ isOpen, onClose, onAdd, stocks }: AddStockModalProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const bgColor = theme === 'dark' ? 'bg-[#1E222D]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-[#D1D4DC]' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#9598A1]' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2E39]' : 'border-gray-200';
  const inputBgColor = theme === 'dark' ? 'bg-[#2A2E39]' : 'bg-gray-100';

  // Sample stock data - replace with actual API call
  // const stocks = [
  //   { symbol: 'NEPSE', name: 'Nepal Stock Exchange' },
  //   { symbol: 'NRIC', name: 'Nepal Reinsurance Company' },
  //   { symbol: 'NBL', name: 'Nepal Bank Limited' },
  //   { symbol: 'SCB', name: 'Standard Chartered Bank' },
  //   { symbol: 'HBL', name: 'Himalayan Bank Limited' },
  // ];

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-4 ${bgColor} rounded-lg shadow-lg z-50`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${textColor}`}>Add Stock to Watchlist</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor}`}
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks..."
            className={`w-full px-4 py-2 rounded-lg ${inputBgColor} ${textColor} placeholder-${secondaryTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Stock List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                onAdd(stock.symbol);
                onClose();
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b ${borderColor} last:border-b-0`}
            >
              <div className={`font-medium ${textColor}`}>{stock.symbol}</div>
              <div className={`text-sm ${secondaryTextColor}`}>{stock.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 