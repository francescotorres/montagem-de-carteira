import {
  QuoteDTO,
  QuoteSource,
  LiveQuoteSource,
  ProgressCallback,
  CachedQuote,
  IQuoteDatabase,
  MarketDataServiceOptions
} from '../types/quote.types.js';

if (typeof process !== 'undefined' && process.env) {
  // Allow Node.js to fetch from B3 Bora Investir and financial portals without failing on leaf certificates (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * In-memory fallback database implementation when no external database is injected.
 * Persists the last known quote across cache expirations.
 */
class InMemoryQuoteDatabase implements IQuoteDatabase {
  private store = new Map<string, QuoteDTO>();

  public getLastKnownQuote(ticker: string): QuoteDTO | null {
    return this.store.get(ticker.toUpperCase()) || null;
  }

  public saveQuote(quote: QuoteDTO): void {
    this.store.set(quote.ticker.toUpperCase(), { ...quote });
  }

  public clear(): void {
    this.store.clear();
  }
}

/**
 * Service responsible for ingesting, routing, caching, and standardizing
 * market quotes across multiple financial data providers.
 */
export class MarketDataService {
  private readonly googleFinanceTtlMs: number;
  private readonly boraInvestirTtlMs: number;
  private readonly fetchFn: typeof fetch;
  private readonly db: IQuoteDatabase;
  private readonly userAgent: string;

  // In-memory cache store
  private readonly cache = new Map<string, CachedQuote>();

  // Specific tickers strictly routed to Bora Investir (B3 Official Portal)
  private readonly boraInvestirTickers = new Set<string>(['SPYI11', 'LFIX11', 'WRLD11']);

  constructor(options: MarketDataServiceOptions = {}) {
    this.googleFinanceTtlMs = options.googleFinanceTtlMs ?? 5 * 60 * 1000; // 5 minutes
    this.boraInvestirTtlMs = options.boraInvestirTtlMs ?? 15 * 60 * 1000; // 15 minutes
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.db = options.db ?? new InMemoryQuoteDatabase();
    this.userAgent =
      options.userAgent ??
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Identifies the required live data source for a given ticker.
   * Routing rule:
   * - Tickers SPYI11 and LFIX11 MUST be routed to Bora Investir.
   * - All other B3 assets MUST be routed to Google Finance.
   */
  public getTargetSource(ticker: string): LiveQuoteSource {
    const normalized = this.normalizeTicker(ticker);
    return this.boraInvestirTickers.has(normalized) ? 'BORA_INVESTIR' : 'GOOGLE_FINANCE';
  }

  /**
   * Fetches quote for a single ticker with caching and fallback resiliency.
   */
  public async getQuote(tickerInput: string, forceRefresh = false): Promise<QuoteDTO> {
    const ticker = this.normalizeTicker(tickerInput);
    if (!ticker) {
      throw new Error('Ticker cannot be empty');
    }

    // 1. Check in-memory cache if not forcing refresh
    if (!forceRefresh) {
      const cached = this.cache.get(ticker);
      if (cached && Date.now() < cached.expiresAt) {
        return { ...cached.quote };
      }
    }

    const source = this.getTargetSource(ticker);

    // 2. Attempt live HTTP ingestion
    try {
      let liveQuote: QuoteDTO;
      if (source === 'BORA_INVESTIR') {
        try {
          liveQuote = await this.fetchFromBoraInvestir(ticker);
        } catch (boraErr) {
          // If Bora Investir fails, attempt Google Finance fallback
          try {
            liveQuote = await this.fetchFromGoogleFinance(ticker);
          } catch {
            throw boraErr;
          }
        }
      } else {
        try {
          liveQuote = await this.fetchFromGoogleFinance(ticker);
        } catch (gfErr) {
          // If Google Finance fails (e.g. for ETFs like WRLD11), attempt Bora Investir fallback
          try {
            liveQuote = await this.fetchFromBoraInvestir(ticker);
          } catch {
            throw gfErr;
          }
        }
      }

      // Calculate provider-specific TTL
      const ttlMs = source === 'BORA_INVESTIR' ? this.boraInvestirTtlMs : this.googleFinanceTtlMs;
      const now = Date.now();

      // Update in-memory cache
      this.cache.set(ticker, {
        quote: { ...liveQuote },
        cachedAt: now,
        expiresAt: now + ttlMs
      });

      // Persist as last known record in database
      await this.db.saveQuote({ ...liveQuote });

      return liveQuote;
    } catch (liveError) {
      // 3. Fallback resiliency: retrieve last known record
      const fallbackQuote = await this.getLastKnownRecord(ticker);
      if (fallbackQuote) {
        const resilientQuote: QuoteDTO = {
          ...fallbackQuote,
          source: 'CACHE_FALLBACK',
          updatedAt: new Date().toISOString()
        };
        return resilientQuote;
      }

      const originalMessage = liveError instanceof Error ? liveError.message : String(liveError);
      throw new Error(
        `Failed to fetch live quote for ${ticker} from ${source} and no fallback record is available: ${originalMessage}`
      );
    }
  }

  /**
   * Batch updates quotes for multiple tickers and emits real-time progress callbacks.
   * Feed real-time UI modal: "Updating TICKER (X/Y)".
   */
  public async updatePortfolioQuotes(
    tickers: string[],
    onProgress?: ProgressCallback
  ): Promise<QuoteDTO[]> {
    const total = tickers.length;
    const results: QuoteDTO[] = [];

    for (let i = 0; i < total; i++) {
      const ticker = this.normalizeTicker(tickers[i]);
      const current = i + 1;
      const message = `Updating ${ticker} (${current}/${total})`;

      // Emit "updating" status notification
      if (onProgress) {
        onProgress({
          ticker,
          current,
          total,
          status: 'updating',
          message
        });
      }

      try {
        const quote = await this.getQuote(ticker);
        results.push(quote);

        // Emit "completed" status notification
        if (onProgress) {
          onProgress({
            ticker,
            current,
            total,
            status: 'completed',
            message: `Updated ${ticker} (${current}/${total})`,
            quote
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Emit "error" status notification
        if (onProgress) {
          onProgress({
            ticker,
            current,
            total,
            status: 'error',
            message: `Failed to update ${ticker} (${current}/${total})`,
            error: errorMessage
          });
        }
      }
    }

    return results;
  }

  /**
   * Bora Investir (B3 Official Portal) scraper and parser.
   * Target URL: https://borainvestir.b3.com.br/cotacoes/etf/{TICKER}
   */
  public async fetchFromBoraInvestir(ticker: string): Promise<QuoteDTO> {
    const url = `https://borainvestir.b3.com.br/cotacoes/etf/${ticker}`;
    const response = await this.fetchFn(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      throw new Error(`Bora Investir returned HTTP status ${response.status} for ${ticker}`);
    }

    const html = await response.text();
    return this.parseBoraInvestirHtml(html, ticker);
  }

  /**
   * Parses Bora Investir HTML markup into the standardized QuoteDTO.
   */
  public parseBoraInvestirHtml(html: string, ticker: string): QuoteDTO {
    // 1. Parse quick metrics from <ul class="asset__info">
    const itemRegex = /<li class="[^"]*asset__info__item[^"]*">([\s\S]*?)<\/li>/gi;
    const items: Record<string, string> = {};
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(html)) !== null) {
      const content = match[1];
      const valMatch = content.match(/<span[^>]*class="[^"]*asset__info__value[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
      const descMatch = content.match(/<p[^>]*class="[^"]*asset__info__desc[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
      if (valMatch && descMatch) {
        const val = valMatch[1].replace(/<[^>]+>/g, '').trim();
        const desc = descMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
        items[desc] = val;
      }
    }

    // Current Price
    let currentPrice = 0;
    const priceRaw = items['valor atual (r$)'] || items['valor atual'] || items['cotação'];
    if (priceRaw) {
      const parsed = this.parseBrlNumber(priceRaw);
      if (!isNaN(parsed) && parsed > 0) currentPrice = parsed;
    }

    if (currentPrice === 0) {
      throw new Error(`Failed to parse current price from Bora Investir for ticker ${ticker}`);
    }

    // Min (dia) / Low
    let low = currentPrice;
    const minRaw = items['mín (dia)'] || items['mínima'] || items['min (dia)'];
    if (minRaw) {
      const parsed = this.parseBrlNumber(minRaw);
      if (!isNaN(parsed) && parsed > 0) low = parsed;
    }

    // Máx (dia) / High
    let high = currentPrice;
    const maxRaw = items['máx (dia)'] || items['máxima'] || items['max (dia)'];
    if (maxRaw) {
      const parsed = this.parseBrlNumber(maxRaw);
      if (!isNaN(parsed) && parsed > 0) high = parsed;
    }

    // Previous Close calculated via Renta. dia (Day Change %)
    let previousClose = currentPrice;
    const rentaRaw = items['renta. dia'] || items['variação (dia)'] || items['variação'];
    if (rentaRaw) {
      const pct = this.parseBrlNumber(rentaRaw.replace('%', ''));
      if (!isNaN(pct)) {
        const factor = 1 + pct / 100;
        if (factor > 0) {
          previousClose = Number((currentPrice / factor).toFixed(2));
        }
      }
    }

    // Volume parsed from table row: Volúme diário (média diária 6 meses)
    let volume = 0;
    const tableRowRegex = /<tr[^>]*class="[^"]*asset__about__item[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
    while ((match = tableRowRegex.exec(html)) !== null) {
      const row = match[1];
      const thMatch = row.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
      const tdMatch = row.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
      if (thMatch && tdMatch) {
        const th = thMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
        const td = tdMatch[1].replace(/<[^>]+>/g, '').trim();
        if (th.includes('volúme diário') || th.includes('volume')) {
          const parsed = this.parseBrlNumber(td.replace(/R\$/i, ''));
          if (!isNaN(parsed) && parsed > 0) {
            volume = parsed;
          }
        }
      }
    }

    // P/L is not applicable to ETFs
    const pl: number | null = null;

    // Dividend Yield
    let dy: number | null = null;
    for (const [desc, val] of Object.entries(items)) {
      if (desc.includes('dy') || desc.includes('dividend') || desc.includes('rendimento')) {
        const parsed = this.parseBrlNumber(val.replace('%', ''));
        if (!isNaN(parsed)) dy = parsed;
      }
    }

    return {
      ticker,
      currentPrice,
      previousClose,
      high,
      low,
      volume,
      pl,
      dy,
      source: 'BORA_INVESTIR',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Google Finance scraper and parser.
   * Target URL: https://www.google.com/finance/quote/{TICKER}:BVMF?hl=en
   */
  public async fetchFromGoogleFinance(ticker: string): Promise<QuoteDTO> {
    const url = `https://www.google.com/finance/quote/${ticker}:BVMF?hl=en`;
    const response = await this.fetchFn(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Finance returned HTTP status ${response.status} for ${ticker}`);
    }

    const html = await response.text();
    return this.parseGoogleFinanceHtml(html, ticker);
  }

  /**
   * Parses Google Finance HTML markup into the standardized QuoteDTO.
   */
  public parseGoogleFinanceHtml(html: string, ticker: string): QuoteDTO {
    // 1. Current Price
    let currentPrice: number | null = null;

    // Pattern 1: Main price container <div class="N6SYTe"><span jsname="Pdsbrc"><span>R$47.99</span></span></div>
    const n6syteMatch = html.match(/class="[^"]*N6SYTe[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (n6syteMatch) {
      const rawText = n6syteMatch[1].replace(/<[^>]+>/g, '').replace(/R\$/i, '').trim();
      const parsed = this.cleanUniversalNumber(rawText);
      if (!isNaN(parsed) && parsed > 0) currentPrice = parsed;
    }

    // Pattern 2: Classic Google Finance price element <div class="YMlKec fxKbKc">R$47.99</div>
    if (currentPrice === null) {
      const ymMatch = html.match(/class="[^"]*YMlKec\s+fxKbKc[^"]*">([^<]+)/i);
      if (ymMatch) {
        const raw = ymMatch[1].replace(/R\$/i, '').trim();
        const parsed = this.cleanUniversalNumber(raw);
        if (!isNaN(parsed) && parsed > 0) currentPrice = parsed;
      }
    }

    // Pattern 3: Header container with asset name and jsname="Pdsbrc"
    if (currentPrice === null) {
      const headerBlockMatch = html.match(/class="gO24Ff"[\s\S]{1,500}?jsname="Pdsbrc"[^>]*>\s*<span[^>]*>([^<]+)<\/span>/i);
      if (headerBlockMatch) {
        const raw = headerBlockMatch[1].replace(/R\$/i, '').trim();
        const parsed = this.cleanUniversalNumber(raw);
        if (!isNaN(parsed) && parsed > 0) currentPrice = parsed;
      }
    }

    // Pattern 4: Script data AF_initDataCallback
    if (currentPrice === null) {
      const afMatch = html.match(
        new RegExp(`\\[\\s*["']${ticker}["']\\s*,\\s*["']BVMF["']\\s*\\],[^,]+,[^,]+,[^,]+,\\[([\\d.]+),`, 'i')
      );
      if (afMatch) {
        const parsed = parseFloat(afMatch[1]);
        if (!isNaN(parsed) && parsed > 0) currentPrice = parsed;
      }
    }

    if (currentPrice === null || currentPrice <= 0) {
      throw new Error(`Failed to parse current price from Google Finance for ticker ${ticker}`);
    }

    // 2. Key Statistics Table (div class="SwQK7" -> div class="dO6ijd")
    const stats: Record<string, string> = {};
    const kvRegex = /<div class="[^"]*SwQK7[^"]*">([^<]+)<\/div>\s*<div class="[^"]*dO6ijd[^"]*">([^<]+)<\/div>/gi;
    let kvMatch: RegExpExecArray | null;

    while ((kvMatch = kvRegex.exec(html)) !== null) {
      const key = kvMatch[1].trim().toLowerCase();
      const val = kvMatch[2].trim();
      if (!stats[key]) {
        stats[key] = val;
      }
    }

    // High & Low
    let high = currentPrice;
    let low = currentPrice;
    const highStr = stats['high'] || stats['alta'] || stats['máxima'];
    if (highStr) {
      const parsed = this.cleanUniversalNumber(highStr.replace(/R\$/i, ''));
      if (!isNaN(parsed) && parsed > 0) high = parsed;
    }

    const lowStr = stats['low'] || stats['baixa'] || stats['mínima'];
    if (lowStr) {
      const parsed = this.cleanUniversalNumber(lowStr.replace(/R\$/i, ''));
      if (!isNaN(parsed) && parsed > 0) low = parsed;
    }

    // Volume
    let volume = 0;
    const volStr = stats['volume'] || stats['vol.'] || stats['avg. vol.'] || stats['volume médio'];
    if (volStr) {
      volume = this.parseHumanVolume(volStr);
    }

    // Previous Close
    let previousClose = currentPrice;
    const prevStr = stats['prev close'] || stats['previous close'] || stats['fechamento anterior'];
    if (prevStr) {
      const parsed = this.cleanUniversalNumber(prevStr.replace(/R\$/i, ''));
      if (!isNaN(parsed) && parsed > 0) previousClose = parsed;
    } else {
      // Deduce from Day Change (e.g. (+0.45) Today or (-1.20) Today)
      // Scope search to the asset header / price container to avoid reading global market indices at top
      const priceContainerIndex = html.indexOf('class="N6SYTe"');
      const searchContext = priceContainerIndex !== -1
        ? html.substring(priceContainerIndex, priceContainerIndex + 800)
        : html;
      const changeMatch = searchContext.match(/<span[^>]*jsname="xnruHf"[^>]*>\s*<span[^>]*>([+-]?[\d.,]+)<\/span>/i);
      if (changeMatch) {
        const changeVal = this.cleanUniversalNumber(changeMatch[1]);
        if (!isNaN(changeVal)) {
          const calculatedPrev = Number((currentPrice - changeVal).toFixed(2));
          // Sanity check: prev close shouldn't deviate wildly from current price (> 50% deviation indicates index contamination)
          if (calculatedPrev > 0 && Math.abs(calculatedPrev - currentPrice) < currentPrice * 0.5) {
            previousClose = calculatedPrev;
          }
        }
      } else {
        const openStr = stats['open'] || stats['abertura'];
        if (openStr) {
          const parsed = this.cleanUniversalNumber(openStr.replace(/R\$/i, ''));
          if (!isNaN(parsed) && parsed > 0) previousClose = parsed;
        }
      }
    }

    // P/E Ratio (PL)
    let pl: number | null = null;
    const plStr = stats['p/e ratio'] || stats['índice p/l'] || stats['p/l'];
    if (plStr && plStr !== '-' && plStr.toLowerCase() !== 'n/a') {
      const parsed = this.cleanUniversalNumber(plStr);
      if (!isNaN(parsed)) pl = parsed;
    }

    // Dividend Yield (DY)
    let dy: number | null = null;
    const dyStr = stats['dividend yield'] || stats['dividend'] || stats['rendimento de dividendos'] || stats['dy'];
    if (dyStr && dyStr !== '-' && dyStr.toLowerCase() !== 'n/a') {
      const parsed = this.cleanUniversalNumber(dyStr.replace('%', ''));
      if (!isNaN(parsed)) dy = parsed;
    }

    return {
      ticker,
      currentPrice,
      previousClose,
      high,
      low,
      volume,
      pl,
      dy,
      source: 'GOOGLE_FINANCE',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Helper to fetch the last known record from DB or in-memory cache.
   */
  private async getLastKnownRecord(ticker: string): Promise<QuoteDTO | null> {
    const dbRecord = await this.db.getLastKnownQuote(ticker);
    if (dbRecord) return dbRecord;

    const cacheEntry = this.cache.get(ticker);
    if (cacheEntry) return cacheEntry.quote;

    return null;
  }

  /**
   * Normalizes ticker symbols.
   */
  public normalizeTicker(ticker: string): string {
    return (ticker || '').trim().toUpperCase();
  }

  /**
   * Parses Brazilian number format: e.g. "2.316.030,00" -> 2316030
   */
  private parseBrlNumber(str: string): number {
    if (!str) return NaN;
    const s = str.trim().replace(/\s/g, '');
    if (s === '-' || s.toLowerCase() === 'não disponível') return NaN;
    const normalized = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized);
  }

  /**
   * Cleans universal number string (handles both US "1,234.56" and BRL "1.234,56").
   */
  private cleanUniversalNumber(str: string): number {
    if (!str) return NaN;
    let s = str.trim().replace(/\s/g, '');
    if (s === '-' || s.toLowerCase() === 'n/a') return NaN;

    if (s.includes('.') && s.includes(',')) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        // BRL: 1.234,56
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // US: 1,234.56
        s = s.replace(/,/g, '');
      }
    } else if (s.includes(',')) {
      s = s.replace(',', '.');
    }

    return parseFloat(s);
  }

  /**
   * Parses human-readable volumes with suffix multipliers (K, M, B, etc.).
   */
  private parseHumanVolume(str: string): number {
    if (!str) return 0;
    const s = str.trim().toUpperCase();
    let multiplier = 1;

    if (s.endsWith('M') || s.endsWith('MI') || s.endsWith('MILHÕES') || s.endsWith('MILHOES')) {
      multiplier = 1_000_000;
    } else if (s.endsWith('B') || s.endsWith('BI') || s.endsWith('BILHÕES') || s.endsWith('BILHOES')) {
      multiplier = 1_000_000_000;
    } else if (s.endsWith('K') || s.endsWith('MIL')) {
      multiplier = 1_000;
    }

    const numPart = s.replace(/[MBK]|MI|BI|MILHÕES|MILHOES|BILHÕES|BILHOES|MIL/gi, '');
    const val = this.cleanUniversalNumber(numPart);
    return isNaN(val) ? 0 : Math.round(val * multiplier);
  }

  /**
   * Cache management methods.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  public getCachedQuote(ticker: string): QuoteDTO | null {
    const cached = this.cache.get(this.normalizeTicker(ticker));
    if (cached && Date.now() < cached.expiresAt) {
      return { ...cached.quote };
    }
    return null;
  }

  public setCache(ticker: string, quote: QuoteDTO, ttlMs?: number): void {
    const norm = this.normalizeTicker(ticker);
    const ttl = ttlMs ?? (this.getTargetSource(norm) === 'BORA_INVESTIR' ? this.boraInvestirTtlMs : this.googleFinanceTtlMs);
    const now = Date.now();
    this.cache.set(norm, {
      quote: { ...quote },
      cachedAt: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Adapts a QuoteDTO into legacy ScrapedMarketData format for downstream
   * portfolio balancing, collateral calculation, and lending modules.
   */
  public toLegacyMarketData(dto: QuoteDTO): {
    ticker: string;
    price: number | null;
    lastDividend: number | null;
    dy12m: number | null;
    name: string | null;
    source: string;
    success: boolean;
  } {
    return {
      ticker: dto.ticker,
      price: dto.currentPrice,
      lastDividend: null,
      dy12m: dto.dy,
      name: dto.ticker,
      source: dto.source,
      success: true
    };
  }
}

// Default singleton instance for application-wide consumption
export const marketDataService = new MarketDataService();
