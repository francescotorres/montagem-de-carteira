import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { QuoteController, createQuoteRouter } from '../src/controllers/quoteController.js';
import { MarketDataService } from '../src/services/MarketDataService.js';
import { QuoteDTO } from '../src/types/quote.types.js';

describe('QuoteController & SSE Streaming', () => {
  let app: Express;
  let mockService: MarketDataService;

  const mockQuotes: Record<string, QuoteDTO> = {
    SPYI11: {
      ticker: 'SPYI11',
      currentPrice: 106.5,
      previousClose: 107.71,
      high: 108.4,
      low: 106.18,
      volume: 2316030,
      pl: null,
      dy: null,
      source: 'BORA_INVESTIR',
      updatedAt: '2026-10-17T20:00:00.000Z'
    },
    WEGE3: {
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
    }
  };

  beforeEach(() => {
    mockService = new MarketDataService();
    vi.spyOn(mockService, 'getQuote').mockImplementation(async (ticker: string) => {
      const q = mockQuotes[ticker.toUpperCase()];
      if (q) return q;
      throw new Error(`Ticker ${ticker} not found`);
    });

    app = express();
    app.use(express.json());
    app.use('/api/quotes', createQuoteRouter(mockService));
  });

  describe('GET /api/quotes/:ticker', () => {
    it('returns standardized QuoteDTO for a valid ticker', async () => {
      const res = await request(app).get('/api/quotes/SPYI11');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ticker: 'SPYI11',
        currentPrice: 106.5,
        source: 'BORA_INVESTIR'
      });
    });

    it('returns 500 when ticker lookup fails', async () => {
      const res = await request(app).get('/api/quotes/INVALID');
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Ticker INVALID not found');
    });
  });

  describe('POST /api/quotes/batch', () => {
    it('returns batch quotes array in standard response', async () => {
      const res = await request(app)
        .post('/api/quotes/batch')
        .send({ tickers: ['SPYI11', 'WEGE3'] });

      expect(res.status).toBe(200);
      expect(res.body.quotes).toHaveLength(2);
      expect(res.body.quotes[0].ticker).toBe('SPYI11');
      expect(res.body.quotes[1].ticker).toBe('WEGE3');
    });

    it('returns 400 when tickers array is empty or missing', async () => {
      const res = await request(app).post('/api/quotes/batch').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/quotes/stream (Server-Sent Events)', () => {
    it('returns 400 when tickers query param is missing', async () => {
      const res = await request(app).get('/api/quotes/stream');
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('streams real-time progress events per ticker via SSE format', async () => {
      const res = await request(app)
        .get('/api/quotes/stream?tickers=SPYI11,WEGE3')
        .expect('Content-Type', /text\/event-stream/)
        .expect(200);

      const raw = res.text;

      // Verify SSE formatting: data: {...}\n\n
      expect(raw).toContain('data: ');
      expect(raw).toContain('Updating SPYI11 (1/2)');
      expect(raw).toContain('Updated SPYI11 (1/2)');
      expect(raw).toContain('Updating WEGE3 (2/2)');
      expect(raw).toContain('Updated WEGE3 (2/2)');
      expect(raw).toContain('event: complete');
    });

    it('supports POST /api/quotes/stream with JSON body', async () => {
      const res = await request(app)
        .post('/api/quotes/stream')
        .send({ tickers: ['SPYI11'] })
        .expect('Content-Type', /text\/event-stream/)
        .expect(200);

      expect(res.text).toContain('Updating SPYI11 (1/1)');
      expect(res.text).toContain('event: complete');
    });
  });
});
