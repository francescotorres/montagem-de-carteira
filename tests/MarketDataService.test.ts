import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketDataService } from '../src/services/MarketDataService.js';
import { QuoteDTO, IQuoteDatabase, ProgressNotification } from '../src/types/quote.types.js';

// Realistic HTML fixtures
const BORA_SPYI11_HTML = `
<html>
<head><title>SPYI11 - Cotação hoje</title></head>
<body>
  <ul class="asset__info">
    <li class="asset__info__item">
      <span class="asset__info__value">106,50</span>
      <p class="asset__info__desc">Valor atual (R$)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value">106,18</span>
      <p class="asset__info__desc">Mín (dia)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value">108,40</span>
      <p class="asset__info__desc">Máx (dia)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value negative">-1,12%</span>
      <p class="asset__info__desc">Renta. dia</p>
    </li>
  </ul>
  <table class="asset__about">
    <tr class="asset__about__item">
      <th>Volúme diário (média diária 6 meses)</th>
      <td>R$ 2.316.030,00</td>
    </tr>
  </table>
</body>
</html>
`;

const BORA_LFIX11_HTML = `
<html>
<head><title>LFIX11 - Cotação hoje</title></head>
<body>
  <ul class="asset__info">
    <li class="asset__info__item">
      <span class="asset__info__value">21,94</span>
      <p class="asset__info__desc">Valor atual (R$)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value">21,93</span>
      <p class="asset__info__desc">Mín (dia)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value">21,94</span>
      <p class="asset__info__desc">Máx (dia)</p>
    </li>
    <li class="asset__info__item">
      <span class="asset__info__value">0,05%</span>
      <p class="asset__info__desc">Renta. dia</p>
    </li>
  </ul>
  <table class="asset__about">
    <tr class="asset__about__item">
      <th>Volúme diário (média diária 6 meses)</th>
      <td>-</td>
    </tr>
  </table>
</body>
</html>
`;

const GOOGLE_WEGE3_HTML = `
<html>
<head><title>Weg SA (WEGE3) Stock Price & News</title></head>
<body>
  <div class="gO24Ff">Weg SA</div>
  <div class="N6SYTe"><span jsname="Pdsbrc"><span>R$47.99</span></span></div>
  <div><span jsname="xnruHf"><span>0.00</span></span> Today</div>
  <div class="SwQK7">High</div><div class="dO6ijd">R$49.32</div>
  <div class="SwQK7">Low</div><div class="dO6ijd">R$47.69</div>
  <div class="SwQK7">Volume</div><div class="dO6ijd">9.90M</div>
  <div class="SwQK7">P/E ratio</div><div class="dO6ijd">32.20</div>
  <div class="SwQK7">Dividend yield</div><div class="dO6ijd">3.49%</div>
</body>
</html>
`;

const GOOGLE_MXRF11_HTML = `
<html>
<head><title>Maxi Renda (MXRF11) FII</title></head>
<body>
  <div class="gO24Ff">Maxi Renda FII</div>
  <div class="N6SYTe"><span jsname="Pdsbrc"><span>R$9.34</span></span></div>
  <div><span jsname="xnruHf"><span>+0.04</span></span> Today</div>
  <div class="SwQK7">High</div><div class="dO6ijd">R$9.39</div>
  <div class="SwQK7">Low</div><div class="dO6ijd">R$9.32</div>
  <div class="SwQK7">Volume</div><div class="dO6ijd">2.18M</div>
</body>
</html>
`;

describe('MarketDataService', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let mockDb: IQuoteDatabase;
  let service: MarketDataService;

  beforeEach(() => {
    mockFetch = vi.fn();
    mockDb = {
      getLastKnownQuote: vi.fn(),
      saveQuote: vi.fn()
    };
    service = new MarketDataService({
      fetchFn: mockFetch as unknown as typeof fetch,
      db: mockDb,
      googleFinanceTtlMs: 5 * 60 * 1000,
      boraInvestirTtlMs: 15 * 60 * 1000
    });
  });

  describe('1. Routing Rules', () => {
    it('MUST route SPYI11, LFIX11, and WRLD11 strictly to Bora Investir', () => {
      expect(service.getTargetSource('SPYI11')).toBe('BORA_INVESTIR');
      expect(service.getTargetSource('LFIX11')).toBe('BORA_INVESTIR');
      expect(service.getTargetSource('WRLD11')).toBe('BORA_INVESTIR');
      expect(service.getTargetSource('spyi11')).toBe('BORA_INVESTIR');
      expect(service.getTargetSource('lfix11')).toBe('BORA_INVESTIR');
      expect(service.getTargetSource('wrld11')).toBe('BORA_INVESTIR');
    });

    it('MUST route all other assets (Stocks, FIIs, BDRs, ETFs) to Google Finance', () => {
      expect(service.getTargetSource('WEGE3')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('wege3')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('KNSC11')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('PETR4')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('VALE3')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('MXRF11')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('HGLG11')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('IVVB11')).toBe('GOOGLE_FINANCE');
      expect(service.getTargetSource('BIDI11')).toBe('GOOGLE_FINANCE');
    });

    it('dispatches HTTP request to Bora Investir URL for SPYI11', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => BORA_SPYI11_HTML
      });

      const quote = await service.getQuote('SPYI11');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toBe('https://borainvestir.b3.com.br/cotacoes/etf/SPYI11');
      expect(quote.source).toBe('BORA_INVESTIR');
    });

    it('dispatches HTTP request to Google Finance URL for WEGE3', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => GOOGLE_WEGE3_HTML
      });

      const quote = await service.getQuote('WEGE3');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toBe('https://www.google.com/finance/quote/WEGE3:BVMF?hl=en');
      expect(quote.source).toBe('GOOGLE_FINANCE');
    });
  });

  describe('2. Target DTO Schema Compliance', () => {
    it('strictly outputs conforming DTO for Bora Investir quotes (SPYI11)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => BORA_SPYI11_HTML
      });

      const quote = await service.getQuote('SPYI11');

      expect(quote).toMatchObject({
        ticker: 'SPYI11',
        currentPrice: 106.5,
        previousClose: 107.71,
        high: 108.4,
        low: 106.18,
        volume: 2316030,
        pl: null,
        dy: null,
        source: 'BORA_INVESTIR'
      });
      expect(typeof quote.updatedAt).toBe('string');
      expect(!isNaN(Date.parse(quote.updatedAt))).toBe(true);
    });

    it('handles ETF with dash volume cleanly (LFIX11)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => BORA_LFIX11_HTML
      });

      const quote = await service.getQuote('LFIX11');

      expect(quote).toMatchObject({
        ticker: 'LFIX11',
        currentPrice: 21.94,
        previousClose: 21.93,
        high: 21.94,
        low: 21.93,
        volume: 0,
        pl: null,
        dy: null,
        source: 'BORA_INVESTIR'
      });
    });

    it('strictly outputs conforming DTO for Google Finance quotes (WEGE3)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => GOOGLE_WEGE3_HTML
      });

      const quote = await service.getQuote('WEGE3');

      expect(quote).toMatchObject({
        ticker: 'WEGE3',
        currentPrice: 47.99,
        previousClose: 47.99,
        high: 49.32,
        low: 47.69,
        volume: 9900000,
        pl: 32.2,
        dy: 3.49,
        source: 'GOOGLE_FINANCE'
      });
      expect(typeof quote.updatedAt).toBe('string');
    });

    it('handles FII quote with null P/L from Google Finance (MXRF11)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => GOOGLE_MXRF11_HTML
      });

      const quote = await service.getQuote('MXRF11');

      expect(quote).toMatchObject({
        ticker: 'MXRF11',
        currentPrice: 9.34,
        previousClose: 9.3,
        high: 9.39,
        low: 9.32,
        volume: 2180000,
        pl: null,
        dy: null,
        source: 'GOOGLE_FINANCE'
      });
    });
  });

  describe('3. Cache Strategy & TTL', () => {
    it('caches Google Finance quotes for 5 minutes (300,000 ms)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => GOOGLE_WEGE3_HTML
      });

      const initialTime = 1000000;
      vi.spyOn(Date, 'now').mockReturnValue(initialTime);

      // Call 1: live fetch
      const q1 = await service.getQuote('WEGE3');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Call 2: after 4 minutes (within 5-min TTL) -> should return cached quote
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 4 * 60 * 1000);
      const q2 = await service.getQuote('WEGE3');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(q2.currentPrice).toBe(q1.currentPrice);

      // Call 3: after 6 minutes (expired TTL) -> should trigger live fetch
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 6 * 60 * 1000);
      await service.getQuote('WEGE3');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('caches Bora Investir quotes for 15 minutes (900,000 ms)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => BORA_SPYI11_HTML
      });

      const initialTime = 2000000;
      vi.spyOn(Date, 'now').mockReturnValue(initialTime);

      // Call 1: live fetch
      await service.getQuote('SPYI11');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Call 2: after 14 minutes (within 15-min TTL) -> cache hit
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 14 * 60 * 1000);
      await service.getQuote('SPYI11');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Call 3: after 16 minutes (expired TTL) -> fresh live fetch
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 16 * 60 * 1000);
      await service.getQuote('SPYI11');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('allows forceRefresh to bypass valid cache', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => GOOGLE_WEGE3_HTML
      });

      await service.getQuote('WEGE3');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Force refresh
      await service.getQuote('WEGE3', true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('4. Resilience & Fallback Mechanism', () => {
    it('gracefully falls back to last known DB record with source CACHE_FALLBACK on network error', async () => {
      const fallbackRecord: QuoteDTO = {
        ticker: 'WEGE3',
        currentPrice: 46.5,
        previousClose: 46.0,
        high: 47.0,
        low: 45.8,
        volume: 8500000,
        pl: 31.0,
        dy: 3.5,
        source: 'GOOGLE_FINANCE',
        updatedAt: '2026-10-15T12:00:00.000Z'
      };

      vi.mocked(mockDb.getLastKnownQuote).mockResolvedValueOnce(fallbackRecord);
      mockFetch.mockRejectedValueOnce(new Error('Network connection timeout (ETIMEDOUT)'));

      const result = await service.getQuote('WEGE3');

      expect(result.source).toBe('CACHE_FALLBACK');
      expect(result.currentPrice).toBe(46.5);
      expect(result.ticker).toBe('WEGE3');
    });

    it('gracefully falls back to expired in-memory cache if DB has no record', async () => {
      // Prime the cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => GOOGLE_WEGE3_HTML
      });

      const initialTime = 3000000;
      vi.spyOn(Date, 'now').mockReturnValue(initialTime);
      await service.getQuote('WEGE3');

      // Now advance time so it expires
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 10 * 60 * 1000);

      // Simulate live fetch failure (e.g. 503 Service Unavailable)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable'
      });

      const result = await service.getQuote('WEGE3');

      expect(result.source).toBe('CACHE_FALLBACK');
      expect(result.currentPrice).toBe(47.99);
    });

    it('throws descriptive error if live fetch fails and no fallback record is available', async () => {
      mockFetch.mockRejectedValueOnce(new Error('DNS Resolution failure'));
      vi.mocked(mockDb.getLastKnownQuote).mockResolvedValueOnce(null);

      await expect(service.getQuote('UNKNOWN11')).rejects.toThrow(
        /Failed to fetch live quote for UNKNOWN11 from GOOGLE_FINANCE and no fallback record is available/i
      );
    });
  });

  describe('5. Batch Update with Progress Callback', () => {
    it('emits real-time progress notifications ("Updating TICKER (X/Y)") per ticker', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('SPYI11')) {
          return { ok: true, status: 200, text: async () => BORA_SPYI11_HTML };
        }
        if (url.includes('WEGE3')) {
          return { ok: true, status: 200, text: async () => GOOGLE_WEGE3_HTML };
        }
        if (url.includes('MXRF11')) {
          return { ok: true, status: 200, text: async () => GOOGLE_MXRF11_HTML };
        }
        throw new Error('Unknown ticker');
      });

      const progressEvents: ProgressNotification[] = [];
      const onProgress = (p: ProgressNotification) => {
        progressEvents.push(p);
      };

      const quotes = await service.updatePortfolioQuotes(['SPYI11', 'WEGE3', 'MXRF11'], onProgress);

      expect(quotes).toHaveLength(3);
      expect(quotes.map((q) => q.ticker)).toEqual(['SPYI11', 'WEGE3', 'MXRF11']);

      // Check emitted progress messages: "Updating TICKER (X/Y)"
      expect(progressEvents[0]).toMatchObject({
        ticker: 'SPYI11',
        current: 1,
        total: 3,
        status: 'updating',
        message: 'Updating SPYI11 (1/3)'
      });

      expect(progressEvents[1]).toMatchObject({
        ticker: 'SPYI11',
        current: 1,
        total: 3,
        status: 'completed',
        message: 'Updated SPYI11 (1/3)'
      });

      expect(progressEvents[2]).toMatchObject({
        ticker: 'WEGE3',
        current: 2,
        total: 3,
        status: 'updating',
        message: 'Updating WEGE3 (2/3)'
      });

      expect(progressEvents[3]).toMatchObject({
        ticker: 'WEGE3',
        current: 2,
        total: 3,
        status: 'completed',
        message: 'Updated WEGE3 (2/3)'
      });

      expect(progressEvents[4]).toMatchObject({
        ticker: 'MXRF11',
        current: 3,
        total: 3,
        status: 'updating',
        message: 'Updating MXRF11 (3/3)'
      });

      expect(progressEvents[5]).toMatchObject({
        ticker: 'MXRF11',
        current: 3,
        total: 3,
        status: 'completed',
        message: 'Updated MXRF11 (3/3)'
      });
    });

    it('handles failures gracefully in batch update without halting the entire process', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('SPYI11')) {
          return { ok: true, status: 200, text: async () => BORA_SPYI11_HTML };
        }
        if (url.includes('FAIL3')) {
          return { ok: false, status: 500, text: async () => 'Server error' };
        }
        return { ok: true, status: 200, text: async () => GOOGLE_WEGE3_HTML };
      });

      const progressEvents: ProgressNotification[] = [];
      const quotes = await service.updatePortfolioQuotes(['SPYI11', 'FAIL3', 'WEGE3'], (p) => {
        progressEvents.push(p);
      });

      // 2 succeeded, 1 failed
      expect(quotes).toHaveLength(2);
      expect(quotes.map((q) => q.ticker)).toEqual(['SPYI11', 'WEGE3']);

      const failEvent = progressEvents.find((p) => p.ticker === 'FAIL3' && p.status === 'error');
      expect(failEvent).toBeDefined();
      expect(failEvent?.message).toBe('Failed to update FAIL3 (2/3)');
    });
  });

  describe('6. Downstream Interface Compatibility', () => {
    it('adapts QuoteDTO to legacy ScrapedMarketData without breaking changes', () => {
      const dto: QuoteDTO = {
        ticker: 'WEGE3',
        currentPrice: 47.99,
        previousClose: 47.99,
        high: 49.32,
        low: 47.69,
        volume: 9900000,
        pl: 32.2,
        dy: 3.49,
        source: 'GOOGLE_FINANCE',
        updatedAt: '2026-10-17T20:00:00.000Z'
      };

      const legacy = service.toLegacyMarketData(dto);

      expect(legacy).toEqual({
        ticker: 'WEGE3',
        price: 47.99,
        lastDividend: null,
        dy12m: 3.49,
        name: 'WEGE3',
        source: 'GOOGLE_FINANCE',
        success: true
      });
    });
  });
});
