import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MarketDataService } from '../src/services/MarketDataService.js';

describe('Real Live HTML Fixtures Ingestion', () => {
  const service = new MarketDataService();

  it('parses real Bora Investir SPYI11 HTML correctly', () => {
    const fixturePath = path.resolve('tests/fixtures/bora_sample.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseBoraInvestirHtml(html, 'SPYI11');

    expect(quote.ticker).toBe('SPYI11');
    expect(quote.currentPrice).toBe(106.5);
    expect(quote.low).toBe(106.18);
    expect(quote.high).toBe(108.4);
    expect(quote.previousClose).toBe(107.71);
    expect(quote.volume).toBe(2316030);
    expect(quote.pl).toBeNull();
    expect(quote.dy).toBeNull();
    expect(quote.source).toBe('BORA_INVESTIR');
    expect(typeof quote.updatedAt).toBe('string');
  });

  it('parses real Bora Investir LFIX11 HTML correctly', () => {
    const fixturePath = path.resolve('tests/fixtures/bora_lfix11.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseBoraInvestirHtml(html, 'LFIX11');

    expect(quote.ticker).toBe('LFIX11');
    expect(quote.currentPrice).toBe(21.94);
    expect(quote.low).toBe(21.93);
    expect(quote.high).toBe(21.94);
    expect(quote.previousClose).toBe(21.93);
    expect(quote.volume).toBe(0);
    expect(quote.pl).toBeNull();
    expect(quote.dy).toBeNull();
    expect(quote.source).toBe('BORA_INVESTIR');
  });

  it('parses real Google Finance WEGE3 HTML correctly', () => {
    const fixturePath = path.resolve('tests/fixtures/gf_sample.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseGoogleFinanceHtml(html, 'WEGE3');

    expect(quote.ticker).toBe('WEGE3');
    expect(quote.currentPrice).toBe(47.99);
    expect(quote.high).toBe(49.32);
    expect(quote.low).toBe(47.69);
    expect(quote.volume).toBe(9900000);
    expect(quote.pl).toBe(32.2);
    expect(quote.dy).toBe(3.49);
    expect(quote.source).toBe('GOOGLE_FINANCE');
  });

  it('parses real Google Finance MXRF11 HTML correctly', () => {
    const fixturePath = path.resolve('tests/fixtures/gf_mxrf11.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseGoogleFinanceHtml(html, 'MXRF11');

    expect(quote.ticker).toBe('MXRF11');
    expect(quote.currentPrice).toBe(9.34);
    expect(quote.high).toBe(9.39);
    expect(quote.low).toBe(9.32);
    expect(quote.volume).toBe(2180000);
    expect(quote.pl).toBeNull();
    expect(quote.dy).toBeNull();
    expect(quote.source).toBe('GOOGLE_FINANCE');
  });

  it('parses real Google Finance KNSC11 HTML correctly without index contamination', () => {
    const fixturePath = path.resolve('tests/fixtures/gf_knsc11.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseGoogleFinanceHtml(html, 'KNSC11');

    expect(quote.ticker).toBe('KNSC11');
    expect(quote.currentPrice).toBe(9.16);
    expect(quote.previousClose).toBe(9.16);
    expect(quote.high).toBe(9.17);
    expect(quote.low).toBe(9.12);
    expect(quote.volume).toBe(479240);
    expect(quote.source).toBe('GOOGLE_FINANCE');
  });

  it('parses real Bora Investir WRLD11 HTML correctly', () => {
    const fixturePath = path.resolve('tests/fixtures/bora_wrld11.html');
    if (!fs.existsSync(fixturePath)) return;

    const html = fs.readFileSync(fixturePath, 'utf8');
    const quote = service.parseBoraInvestirHtml(html, 'WRLD11');

    expect(quote.ticker).toBe('WRLD11');
    expect(quote.currentPrice).toBe(144.15);
    expect(quote.previousClose).toBe(145.71);
    expect(quote.high).toBe(146.17);
    expect(quote.low).toBe(143.6);
    expect(quote.volume).toBe(7452433);
    expect(quote.source).toBe('BORA_INVESTIR');
  });
});
