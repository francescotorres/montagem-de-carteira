import type { IncomingMessage, ServerResponse } from 'http';
import { MarketDataService } from '../src/services/MarketDataService.js';
import type { ProgressNotification } from '../src/types/quote.types.js';

const marketDataService = new MarketDataService();

export default async function handler(req: IncomingMessage & { query?: Record<string, string>; body?: any }, res: ServerResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Parse URL query
  const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const stream = parsedUrl.searchParams.get('stream') === 'true' || parsedUrl.pathname.includes('/stream');
  const tickersParam = parsedUrl.searchParams.get('tickers') || parsedUrl.searchParams.get('ticker');
  const singleTicker = parsedUrl.searchParams.get('ticker');

  // Single ticker lookup
  if (singleTicker && !stream) {
    try {
      const quote = await marketDataService.getQuote(singleTicker);
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify(quote));
      return;
    } catch (err: any) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Batch stream with SSE
  const tickers = (tickersParam || '').split(',').map((t) => t.trim()).filter(Boolean);

  if (tickers.length === 0) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Parâmetro tickers é obrigatório (ex: ?tickers=SPYI11,WEGE3)' }));
    return;
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const quotes = await marketDataService.updatePortfolioQuotes(
        tickers,
        (progress: ProgressNotification) => {
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );
      res.write(`event: complete\ndata: ${JSON.stringify({ done: true, quotes })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
    return;
  }

  // Standard JSON batch response
  try {
    const quotes = await marketDataService.updatePortfolioQuotes(tickers);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ quotes }));
  } catch (err: any) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
}
