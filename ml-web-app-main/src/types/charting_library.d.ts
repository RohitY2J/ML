/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'charting_library' {
  export type ResolutionString = '1' | '5' | '15' | '30' | '60' | '1D' | '1W' | '1M';

  export interface LibrarySymbolInfo {
    name: string;
    full_name: string;
    description: string;
    type: string;
    session: string;
    timezone: string;
    ticker: string;
    minmov: number;
    pricescale: number;
    has_intraday: boolean;
    has_daily: boolean;
    has_weekly_and_monthly: boolean;
    supported_resolutions: ResolutionString[];
    volume_precision: number;
    data_status: string;
  }

  export interface Bar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  export interface PeriodParams {
    from: number;
    to: number;
    firstDataRequest: boolean;
  }

  export interface HistoryCallback {
    (bars: Bar[], meta: { noData: boolean }): void;
  }

  export interface SubscribeBarsCallback {
    (bar: Bar): void;
  }

  export interface IBasicDataFeed {
    onReady(callback: (configuration: any) => void): void;
    searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: (result: any[]) => void): void;
    resolveSymbol(symbolName: string, onResolve: (symbolInfo: LibrarySymbolInfo) => void): void;
    getBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams, onResult: HistoryCallback): Promise<void>;
    subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string): void;
    unsubscribeBars(listenerGuid: string): void;
  }
} 