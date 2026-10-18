import type { ScrapedMarketData } from '../types';
import type { QuoteDTO, ProgressNotification, ProgressCallback } from '../types/quote.types';

const BORA_INVESTIR_TICKERS = new Set(['SPYI11', 'LFIX11', 'WRLD11']);
const CACHE_KEY_PREFIX = 'b3_quote_cache_';
const GOOGLE_FINANCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BORA_INVESTIR_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedEntry {
  quote: QuoteDTO;
  cachedAt: number;
  expiresAt: number;
}

function getStoredCache(ticker: string): CachedEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + ticker.toUpperCase());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredCache(quote: QuoteDTO): void {
  try {
    const ticker = quote.ticker.toUpperCase();
    const isBora = BORA_INVESTIR_TICKERS.has(ticker);
    const ttl = isBora ? BORA_INVESTIR_TTL_MS : GOOGLE_FINANCE_TTL_MS;
    const entry: CachedEntry = {
      quote,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    localStorage.setItem(CACHE_KEY_PREFIX + ticker, JSON.stringify(entry));
  } catch {
    // Ignore localStorage errors
  }
}


/**
 * Consulta cotação para um único ativo com roteamento estrito e fallbacks:
 * - SPYI11, LFIX11 e WRLD11: Bora Investir (Portal Oficial B3)
 * - Demais ativos: Google Finance (BVMF:TICKER)
 */
export async function fetchMarketQuote(tickerInput: string): Promise<ScrapedMarketData> {
  const ticker = tickerInput.trim().toUpperCase();
  if (!ticker) {
    return {
      ticker: '',
      price: null,
      lastDividend: null,
      dy12m: null,
      name: null,
      source: 'Nenhuma',
      success: false,
      errorMessage: 'Ticker inválido.',
    };
  }

  // 1. Verificar cache local válido
  const cached = getStoredCache(ticker);
  if (cached && Date.now() < cached.expiresAt) {
    return {
      ticker,
      price: cached.quote.currentPrice,
      lastDividend: null,
      dy12m: cached.quote.dy,
      name: ticker,
      source: cached.quote.source,
      success: true,
    };
  }

  // 2. Tentar API do backend (/api/quotes?ticker=TICKER)
  try {
    const res = await fetch(`/api/quotes?ticker=${ticker}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data: QuoteDTO = await res.json();
      if (data && data.currentPrice > 0) {
        setStoredCache(data);
        return {
          ticker,
          price: data.currentPrice,
          lastDividend: null,
          dy12m: data.dy,
          name: ticker,
          source: data.source,
          success: true,
        };
      }
    }
  } catch {
    // Prossegue para provedores alternativos / fallback
  }

  // 3. Fallback: Brapi API
  try {
    const brapiToken = import.meta.env.VITE_BRAPI_TOKEN;
    const brapiUrl = brapiToken
      ? `https://brapi.dev/api/quote/${ticker}?token=${brapiToken}&range=1d&interval=1d`
      : `https://brapi.dev/api/quote/${ticker}?range=1d&interval=1d`;

    const res = await fetch(brapiUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const price = item.regularMarketPrice || item.historicalDataPrice?.[0]?.close;
        if (price && price > 0) {
          const quoteDto: QuoteDTO = {
            ticker,
            currentPrice: Number(price.toFixed(2)),
            previousClose: item.regularMarketPreviousClose || price,
            high: item.regularMarketDayHigh || price,
            low: item.regularMarketDayLow || price,
            volume: item.regularMarketVolume || 0,
            pl: null,
            dy: null,
            source: 'BORA_INVESTIR',
            updatedAt: new Date().toISOString(),
          };
          setStoredCache(quoteDto);
          return {
            ticker,
            price: Number(price.toFixed(2)),
            lastDividend: null,
            dy12m: null,
            name: item.shortName || item.longName || ticker,
            source: 'Brapi / B3',
            success: true,
          };
        }
      }
    }
  } catch {
    // Prossegue para Yahoo Finance via AllOrigins
  }

  // 4. Fallback: Yahoo Finance via AllOrigins
  try {
    const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.SA`);
    const res = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (result) {
        const meta = result.meta;
        const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
        if (price && price > 0) {
          return {
            ticker,
            price: Number(price.toFixed(2)),
            lastDividend: null,
            dy12m: null,
            name: meta?.shortName || ticker,
            source: 'Yahoo Finance (B3)',
            success: true,
          };
        }
      }
    }
  } catch {
    // Falha silenciosa para fallback do cache expirado
  }

  // 5. Fallback Resiliente: Usar registro em cache conhecido
  if (cached) {
    return {
      ticker,
      price: cached.quote.currentPrice,
      lastDividend: null,
      dy12m: cached.quote.dy,
      name: ticker,
      source: 'CACHE_FALLBACK',
      success: true,
    };
  }

  return {
    ticker,
    price: null,
    lastDividend: null,
    dy12m: null,
    name: null,
    source: 'Nenhuma',
    success: false,
    errorMessage: `Não foi possível obter cotação ao vivo para ${ticker}. Verifique a conexão.`,
  };
}

/**
 * Atualização em lote com suporte a Server-Sent Events (SSE) ou execução progressiva
 * para alimentar a tela modal em tempo real: "Atualizando TICKER (X/Y)".
 */
export async function updatePortfolioQuotes(
  tickers: string[],
  onProgress?: ProgressCallback
): Promise<QuoteDTO[]> {
  const normalizedTickers = tickers.map((t) => t.trim().toUpperCase()).filter(Boolean);
  const total = normalizedTickers.length;
  if (total === 0) return [];

  // 1. Tentar streaming via Server-Sent Events do backend (/api/quotes?stream=true&tickers=...)
  try {
    const sseUrl = `/api/quotes?stream=true&tickers=${encodeURIComponent(normalizedTickers.join(','))}`;
    const response = await fetch(sseUrl, {
      headers: { Accept: 'text/event-stream' },
      signal: AbortSignal.timeout(30000),
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const results: QuoteDTO[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace(/^data:\s*/, '').trim();
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.status && onProgress) {
                onProgress(parsed as ProgressNotification);
                if (parsed.quote) {
                  results.push(parsed.quote);
                  setStoredCache(parsed.quote);
                }
              }
            } catch {
              // Ignore non-json lines
            }
          }
        }
      }

      if (results.length > 0) {
        return results;
      }
    }
  } catch {
    // Prossegue para execução direta em caso de indisponibilidade da API SSE
  }

  // 2. Execução progressiva direta com emissão de eventos para cada ticker
  const results: QuoteDTO[] = [];

  for (let i = 0; i < total; i++) {
    const ticker = normalizedTickers[i];
    const current = i + 1;
    const message = `Atualizando ${ticker} (${current}/${total})`;

    if (onProgress) {
      onProgress({
        ticker,
        current,
        total,
        status: 'updating',
        message,
      });
    }

    try {
      const scraped = await fetchMarketQuote(ticker);
      if (scraped.success && scraped.price && scraped.price > 0) {
        const isBora = BORA_INVESTIR_TICKERS.has(ticker);
        const source = scraped.source === 'CACHE_FALLBACK'
          ? 'CACHE_FALLBACK'
          : isBora
          ? 'BORA_INVESTIR'
          : 'GOOGLE_FINANCE';

        const quote: QuoteDTO = {
          ticker,
          currentPrice: scraped.price,
          previousClose: scraped.price,
          high: scraped.price,
          low: scraped.price,
          volume: 0,
          pl: null,
          dy: scraped.dy12m,
          source,
          updatedAt: new Date().toISOString(),
        };

        results.push(quote);
        setStoredCache(quote);

        if (onProgress) {
          onProgress({
            ticker,
            current,
            total,
            status: 'completed',
            message: `Atualizado ${ticker} (${current}/${total})`,
            quote,
          });
        }
      } else {
        throw new Error(scraped.errorMessage || 'Falha na consulta');
      }
    } catch (err: any) {
      if (onProgress) {
        onProgress({
          ticker,
          current,
          total,
          status: 'error',
          message: `Falha ao atualizar ${ticker} (${current}/${total})`,
          error: err.message,
        });
      }
    }

    // Pequeno intervalo visual suave entre tickers (150ms)
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return results;
}
