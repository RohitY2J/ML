/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
  PeriodParams,
  HistoryCallback,
} from "charting_library";
import axiosInstance from "@/lib/axios";

export class CustomDatafeed {
  private currentSymbol: string;
  private startDate: string = "2010-01-01";
  private endDate: string = "2025-12-31";
  private cachedData: any[] | null = null;
  private symbols: any[] = [];

  constructor(initialSymbol: string = "NEPSE") {
    this.currentSymbol = initialSymbol;
    this.loadSymbols();
    this.loadData();
  }

  private async loadSymbols() {
    try {
      const response = await axiosInstance.get("/api/symbols");
      this.symbols = response.data.data || [];
    } catch (error) {
      console.error("Error fetching symbols:", error);
      this.symbols = [];
    }
  }

  private async loadData() {
    try {
      console.log("Fetching data for symbol:", this.currentSymbol);
      const response = await axiosInstance.get(
        `/api/stocks/daily/${this.currentSymbol}`,
        {
          params: {
            startDate: this.startDate,
            endDate: this.endDate,
          },
        }
      );
      console.log("Received data:", response.data);
      this.cachedData = response.data.data || [];
    } catch (error) {
      console.error("Error fetching stock data:", error);
      this.cachedData = [];
    }
  }

  public setSymbol(symbol: string) {
    if (this.currentSymbol !== symbol) {
      this.currentSymbol = symbol;
      this.cachedData = null; // Clear cached data
      this.loadData(); // Load new data for the symbol
    }
  }

  onReady(callback: (configuration: any) => void) {
    callback({
      supported_resolutions: ["1D"] as ResolutionString[],
      exchanges: [],
      symbols_types: [],
    });
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (result: any[]) => void
  ) {
    const searchResults = this.symbols
      .filter((symbol) => {
        const searchStr = userInput.toUpperCase();
        return symbol.symbol.toUpperCase().includes(searchStr);
      })
      .map((symbol) => ({
        symbol: symbol.symbol,
        full_name: symbol.symbol,
        description: symbol.symbol,
        exchange: "NEPSE",
        type: "stock",
      }));

    onResult(searchResults);
  }

  resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void
  ) {
    const symbol = this.symbols.find((s) => s.symbol === symbolName) || {
      symbol: symbolName,
    };

    onResolve({
      name: symbol.symbol,
      full_name: symbol.symbol,
      description: symbol.symbol,
      type: "stock",
      session: "24x7",
      timezone: "Asia/Kathmandu",
      ticker: symbol.symbol,
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      has_daily: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ["1D"] as ResolutionString[],
      volume_precision: 2,
      data_status: "streaming",
    });
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback
  ): Promise<void> {
    if (!this.cachedData) {
      // If data is not loaded yet, wait for it
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getBars(symbolInfo, resolution, periodParams, onResult);
    }

    const bars = this.cachedData.map((entry: any) => ({
      time: new Date(entry.date).getTime(),
      open: entry.open,
      high: entry.high,
      low: entry.low,
      close: entry.close,
      volume: entry.volume,
    }));

    onResult(bars, {
      noData: bars.length === 0,
    });
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string
  ) {
    // No real-time data for now
  }

  unsubscribeBars(listenerGuid: string) {
    // No real-time data for now
  }
}
