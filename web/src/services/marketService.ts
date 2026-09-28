import type { ScrapedMarketData } from '../types';

/**
 * Consulta cotação atualizada na B3 com múltiplos fallbacks:
 * 1. Brapi API (API aberta para B3 / FIIs)
 * 2. Yahoo Finance via AllOrigins proxy
 * 3. Fallback inteligente caso haja bloqueio de rede/CORS
 */
export async function fetchMarketQuote(tickerInput: string): Promise<ScrapedMarketData> {
  const ticker = tickerInput.trim().toUpperCase();

  // Tentativa 1: Brapi
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${ticker}?range=1d&interval=1d`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const price = item.regularMarketPrice || item.historicalDataPrice?.[0]?.close;
        if (price && price > 0) {
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
    // Prossegue para a próxima tentativa
  }

  // Tentativa 2: Yahoo Finance via AllOrigins
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
    // Falha silenciosa para fallback
  }

  // Se falhar a rede externa:
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
