import React, { useState } from "react";
import { useTradingSignals } from "@/hooks/useTradingSignals";
import { useTheme } from "@/context/ThemeContext";
import { TradingSignal } from "@/services/api/tradingSignals";
import { RiArrowDownSLine, RiAddFill } from "react-icons/ri";

// Symbol mapping
const sectorSymbols = {
  hydro: [
    "NHPC",
    "BPCL",
    "CHCL",
    "AHPC",
    "SHPC",
    "RIDI",
    "BARUN",
    "API",
    "NGPL",
    "KKHC",
    "DHPL",
    "AKPL",
    "SPDL",
    "UMHL",
    "CHL",
    "HPPL",
    "NHDL",
    "RADHI",
    "PMHPL",
    "KPCL",
    "AKJCL",
    "JOSHI",
    "UPPER",
    "GHL",
    "UPCL",
    "MHNL",
    "PPCL",
    "HURJA",
    "UNHPL",
    "RHPL",
    "SJCL",
    "HDHPC",
    "LEC",
    "SSHL",
    "MEN",
    "UMRH",
    "GLH",
    "SHEL",
    "RURU",
    "MKJC",
    "SAHAS",
    "TPC",
    "SPC",
    "NYADI",
    "MBJC",
    "BNHC",
    "GVL",
    "BHL",
    "RFPL",
    "DORDI",
    "BHDC",
    "HHL",
    "UHEWA",
    "SGHC",
    "MHL",
    "USHEC",
    "RHGCL",
    "SPHL",
    "PPL",
    "SIKLES",
    "EHPL",
    "PHCL",
    "BHPL",
    "SMHL",
    "SPL",
    "SMH",
    "MKHC",
    "AHL",
    "TAMOR",
    "MHCL",
    "SMJC",
    "MAKAR",
    "MKHL",
    "DOLTI",
    "BEDC",
    "MCHL",
    "IHL",
    "MEL",
    "RAWA",
    "USHL",
    "TSHL",
    "KBSH",
    "MEHL",
    "ULHC",
    "MANDU",
    "BGWT",
    "MSHL",
    "MMKJL",
    "TVCL",
    "VLUCL",
    "CKHL",
    "SANVI",
  ],
  hotels: ["SHL", "TRH", "OHL", "CGH", "KDL", "CITY"],
  banks: [
    "NABIL",
    "NIMB",
    "SCB",
    "HBL",
    "SBI",
    "EBL",
    "NICA",
    "MBL",
    "LSL",
    "KBL",
    "SBL",
    "SANIMA",
    "NMB",
    "PRVU",
    "GBIME",
    "CZBIL",
    "PCBL",
    "ADBL",
    "NBL",
    "NABBC",
    "EDBL",
    "LBBL",
    "MDB",
    "MLBL",
    "GBBL",
    "JBBL",
    "CORBL",
    "KSBBL",
    "SADBL",
    "SHINE",
    "MNBBL",
    "SINDU",
    "GRDBL",
    "SAPDBL",
  ],
};

interface TradingSignalsTableProps {
  onStockClick: (symbol: string) => void;
}

export const TradingSignalsTable: React.FC<TradingSignalsTableProps> = ({ onStockClick }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "hold">("buy");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const { theme } = useTheme();
  const { data, isLoading, error } = useTradingSignals();

  const bgColor = theme === "dark" ? "bg-[#1E222D]" : "bg-white";
  const tabBgColor = theme === "dark" ? "bg-[#2A2E39]" : "bg-[#EFF2F5]";
  const tabIndicatorColor = theme === "dark" ? "bg-dark-default" : "bg-white";
  const textColor = theme === "dark" ? "text-[#D1D4DC]" : "text-gray-900";
  const secondaryTextColor = theme === "dark" ? "text-[#9598A1]" : "text-gray-500";
  const positiveColor = "text-[#26a69a]";
  const negativeColor = "text-[#ef5350]";

  const filteredSignals =
    data?.data?.filter((signal: TradingSignal) => {
      // Tab filtering (BUY / SELL / HOLD)
      if (activeTab === "buy" && signal.signal !== "BUY") return false;
      if (activeTab === "sell" && signal.signal !== "SELL") return false;
      if (activeTab === "hold" && signal.signal !== "HOLD") return false;

      // Sector filtering
      if (selectedSector && sectorSymbols[selectedSector as keyof typeof sectorSymbols]) {
        return sectorSymbols[selectedSector as keyof typeof sectorSymbols].includes(signal.symbol);
      }

      return true;
    }) || [];

  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <div className="mb-4 relative">
        <select
          className={`w-full py-2 pr-10 pl-3 rounded-md ${textColor} text-sm ${
            theme === "dark" ? "bg-[#2A2E39]" : "bg-gray-100"
          } appearance-none focus:outline-none focus:ring-2 focus:ring-green-500`}
          defaultValue=""
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="" disabled>
            Filter by Sector
          </option>
          <option value="hydro">Hydro</option>
          <option value="hotels">Hotels</option>
          <option value="banks">Banks</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <RiArrowDownSLine className={`w-4 h-4 ${textColor}`} />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className={`relative flex mb-4 ${tabBgColor} rounded-lg p-1`}>
        {["buy", "sell", "hold"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "buy" | "sell" | "hold")}
            className={`relative flex-1 py-2 text-11 transition-colors duration-300 rounded-md z-10 ${
              activeTab === tab ? textColor : `${secondaryTextColor} font-normal`
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        <div
          className={`absolute h-[calc(100%-8px)] w-[calc(33.33%-4px)] ${tabIndicatorColor} rounded-md transition-all duration-300 ease-in-out ${
            activeTab === "buy"
              ? "left-1"
              : activeTab === "sell"
              ? "left-[calc(33.33%+2px)]"
              : "left-[calc(66.66%+3px)]"
          }`}
        />
      </div>

      {/* Table */}
      <div className="relative">
        <div className={`max-h-[250px] overflow-y-auto scrollbar-light`}>
          <table className="w-full">
            <thead className={`${bgColor} sticky top-0 z-10`}>
              <tr className={`text-left text-11 ${secondaryTextColor}`}>
                <th className="pb-2">S.N</th>
                <th className="pb-2">Stock</th>
                <th className="pb-2">LTP</th>
                <th className="pb-2">Change</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className={`py-2 text-center ${textColor}`}>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-2 text-center text-red-500">
                    Error loading signals
                  </td>
                </tr>
              ) : filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`py-2 text-center ${textColor}`}>
                    No signals found
                  </td>
                </tr>
              ) : (
                filteredSignals.map((signal, index) => (
                  <tr
                    key={signal.id}
                    onClick={() => onStockClick(signal.symbol)}
                    className="cursor-pointer hover:opacity-80 group"
                  >
                    <td className={`py-1 text-11 ${textColor} relative`}>
                      <span className="group-hover:opacity-0 transition-opacity duration-200">
                        {index + 1}
                      </span>
                      <span className="absolute inset-0 text-md flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-green-500 font-bold">
                        <RiAddFill className="w-4 h-4 text-green-400" />
                      </span>
                    </td>
                    <td className={`py-1 text-11 font-semibold ${textColor}`}>{signal.symbol}</td>
                    <td className={`py-1 text-11 ${textColor}`}>{signal.ltp}</td>
                    <td
                      className={`py-1 text-11 ${
                        parseFloat(signal.change_percent) >= 0 ? positiveColor : negativeColor
                      }`}
                    >
                      {signal.change_percent}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
