import { Request, Response, Router } from 'express';
import { MarketDataService, marketDataService } from '../services/MarketDataService.js';
import { ProgressNotification } from '../types/quote.types.js';

/**
 * Controller providing Server-Sent Events (SSE) streaming and REST endpoints
 * for real-time portfolio market data updates.
 */
export class QuoteController {
  private service: MarketDataService;

  constructor(service: MarketDataService = marketDataService) {
    this.service = service;
  }

  /**
   * SSE Stream endpoint.
   * Feeds the real-time UI modal: "Updating TICKER (X/Y)".
   *
   * Route: GET /stream?tickers=SPYI11,WEGE3,MXRF11 or POST /stream with { tickers: [...] }
   */
  public streamPortfolioQuotes = async (req: Request, res: Response): Promise<void> => {
    const rawTickers = req.method === 'POST' ? req.body?.tickers : req.query.tickers;

    let tickers: string[] = [];
    if (typeof rawTickers === 'string') {
      tickers = rawTickers.split(',').map((t) => t.trim()).filter(Boolean);
    } else if (Array.isArray(rawTickers)) {
      tickers = rawTickers.map((t) => String(t).trim()).filter(Boolean);
    }

    if (tickers.length === 0) {
      res.status(400).json({
        error: 'Invalid or missing tickers parameter. Provide comma-separated tickers or an array.'
      });
      return;
    }

    // Configure Server-Sent Events (SSE) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    let isAborted = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        isAborted = true;
      }
    });

    try {
      const quotes = await this.service.updatePortfolioQuotes(
        tickers,
        (progress: ProgressNotification) => {
          if (isAborted || res.writableEnded) return;
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );

      if (!res.writableEnded && !isAborted) {
        // Emit completion event with full payload
        res.write(`event: complete\ndata: ${JSON.stringify({ done: true, count: quotes.length, quotes })}\n\n`);
        res.end();
      }
    } catch (error) {
      if (!res.writableEnded) {
        const message = error instanceof Error ? error.message : String(error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      }
    }
  };

  /**
   * REST endpoint to fetch a single quote.
   * Route: GET /:ticker
   */
  public getQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawParam = req.params.ticker;
      const ticker = Array.isArray(rawParam) ? rawParam[0] : rawParam;
      if (!ticker) {
        res.status(400).json({ error: 'Ticker parameter is required.' });
        return;
      }
      const forceRefresh = req.query.forceRefresh === 'true';
      const quote = await this.service.getQuote(ticker, forceRefresh);
      res.json(quote);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  };

  /**
   * REST endpoint for batch updates without SSE.
   * Route: POST /batch
   */
  public batchQuotes = async (req: Request, res: Response): Promise<void> => {
    try {
      const tickers: string[] = req.body?.tickers;
      if (!Array.isArray(tickers) || tickers.length === 0) {
        res.status(400).json({ error: 'Request body must include an array of tickers.' });
        return;
      }
      const quotes = await this.service.updatePortfolioQuotes(tickers);
      res.json({ quotes });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: message });
    }
  };
}

/**
 * Creates and configures an Express Router with the quote ingestion endpoints.
 */
export function createQuoteRouter(service: MarketDataService = marketDataService): Router {
  const router = Router();
  const controller = new QuoteController(service);

  router.get('/stream', controller.streamPortfolioQuotes);
  router.post('/stream', controller.streamPortfolioQuotes);
  router.get('/:ticker', controller.getQuote);
  router.post('/batch', controller.batchQuotes);

  return router;
}

export const quoteRouter = createQuoteRouter();
