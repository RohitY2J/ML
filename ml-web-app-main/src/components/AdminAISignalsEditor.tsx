"use client";

import { useTheme } from "@/context/ThemeContext";
import { TradeForm } from "./AdminTradeForm";

// AISignalsEditor Component
export const AISignalsEditor: React.FC = () => {
  const { theme } = useTheme();
  return <TradeForm theme={theme} />;
};
