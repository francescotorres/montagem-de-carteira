/**
 * Target DTO and type definitions for Market Data Ingestion.
 * Adheres strictly to the Portfolio Management and Asset Backed Lending specifications.
 */

export type QuoteSource = 'GOOGLE_FINANCE' | 'BORA_INVESTIR' | 'CACHE_FALLBACK';

export type LiveQuoteSource = 'GOOGLE_FINANCE' | 'BORA_INVESTIR';

/**
 * Standardized Data Transfer Object for all market quote providers.
 */
export interface QuoteDTO {
  ticker: string;
  currentPrice: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  pl: number | null;
  dy: number | null;
  source: QuoteSource;
  updatedAt: string; // ISO 8601 string
}

/**
 * Status of individual ticker progress during batch updates.
 */
export type ProgressStatus = 'updating' | 'completed' | 'error';

/**
 * Payload emitted to the progress callback during batch updates.
 * Used to feed real-time UI modals: "Updating TICKER (X/Y)".
 */
export interface ProgressNotification {
  ticker: string;
  current: number;
  total: number;
  status: ProgressStatus;
  message: string;
  quote?: QuoteDTO;
  error?: string;
}

export type ProgressCallback = (progress: ProgressNotification) => void;

/**
 * Cache record representation including TTL information.
 */
export interface CachedQuote {
  quote: QuoteDTO;
  cachedAt: number;
  expiresAt: number;
}

/**
 * Pluggable database store interface for persistent fallback resiliency.
 */
export interface IQuoteDatabase {
  getLastKnownQuote(ticker: string): Promise<QuoteDTO | null> | QuoteDTO | null;
  saveQuote(quote: QuoteDTO): Promise<void> | void;
}

/**
 * Options for configuring MarketDataService.
 */
export interface MarketDataServiceOptions {
  /**
   * Time to live for Google Finance quotes in milliseconds. Defaults to 5 minutes (300,000 ms).
   */
  googleFinanceTtlMs?: number;

  /**
   * Time to live for Bora Investir quotes in milliseconds. Defaults to 15 minutes (900,000 ms).
   */
  boraInvestirTtlMs?: number;

  /**
   * Custom fetch function (useful for tests, proxies, or custom TLS settings).
   */
  fetchFn?: typeof fetch;

  /**
   * Optional custom database store. If omitted, an internal persistent fallback store is used.
   */
  db?: IQuoteDatabase;

  /**
   * Custom user-agent header.
   */
  userAgent?: string;
}
