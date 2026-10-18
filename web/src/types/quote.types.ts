export type QuoteSource = 'GOOGLE_FINANCE' | 'BORA_INVESTIR' | 'CACHE_FALLBACK';

export type LiveQuoteSource = 'GOOGLE_FINANCE' | 'BORA_INVESTIR';

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

export type ProgressStatus = 'updating' | 'completed' | 'error';

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
