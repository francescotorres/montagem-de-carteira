import React, { useState } from 'react';
import type { FiiAsset } from '../types';
import { fetchMarketQuote } from '../services/marketService';
import { X, Search, Loader2 } from 'lucide-react';

interface AddEditAssetModalProps {
  initialAsset?: FiiAsset | null;
  onDismiss: () => void;
  onSave: (asset: FiiAsset) => void;
}

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({
  initialAsset,
  onDismiss,
  onSave,
}) => {
  const [ticker, setTicker] = useState(initialAsset?.ticker || '');
  const [name, setName] = useState(initialAsset?.name || '');
  const [category, setCategory] = useState(initialAsset?.category || 'CRI / Papel');
  const [segmentType, setSegmentType] = useState(initialAsset?.segmentType || 'Papel');
  const [currentPrice, setCurrentPrice] = useState(initialAsset?.currentPrice?.toString() || '10.00');
  const [lastDividend, setLastDividend] = useState(initialAsset?.lastDividend?.toString() || '0.10');
  const [shares, setShares] = useState(initialAsset?.shares?.toString() || '100');
  const [gestora, setGestora] = useState(initialAsset?.gestora || '');
  const [summaryText, setSummaryText] = useState(initialAsset?.summaryText || '');

  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const categories = [
    'CRA / Fiagro',
    'CRI / Papel',
    'Logística / Tijolo',
    'Terras / Agrícola',
    'Shopping / Tijolo',
    'ETF Mundial',
    'Energia Alternativas',
    'ETF Renda Fixa',
    'Outros',
  ];

  const handleSearchOnline = async () => {
    if (!ticker.trim()) {
      setSearchFeedback('Digite o ticker antes de buscar.');
      return;
    }
    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const quote = await fetchMarketQuote(ticker);
      if (quote.success && quote.price) {
        setCurrentPrice(quote.price.toFixed(2));
        if (quote.name) setName(quote.name);
        if (quote.lastDividend) setLastDividend(quote.lastDividend.toFixed(2));
        setSearchFeedback(`Cotação encontrada com sucesso via ${quote.source}!`);
      } else {
        setSearchFeedback(quote.errorMessage || 'Não foi possível obter dados na B3.');
      }
    } catch {
      setSearchFeedback('Erro ao conectar com serviço de cotações.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    const assetToSave: FiiAsset = {
      ticker: ticker.trim().toUpperCase(),
      name: name.trim() || ticker.trim().toUpperCase(),
      category,
      segmentType,
      currentPrice: parseFloat(currentPrice) || 0,
      lastDividend: parseFloat(lastDividend) || 0,
      shares: parseInt(shares) || 0,
      targetPercentage: initialAsset?.targetPercentage || 11.11,
      isSelected: initialAsset ? initialAsset.isSelected : true,
      isLocked: initialAsset ? initialAsset.isLocked : false,
      isPriceUpdated: initialAsset ? initialAsset.isPriceUpdated : true,
      gestora: gestora.trim(),
      summaryText: summaryText.trim(),
      recommendedProfiles: initialAsset?.recommendedProfiles || 'MODERADO',
      lastUpdated: Date.now(),
    };

    onSave(assetToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {initialAsset ? `Editar Ativo: ${initialAsset.ticker}` : 'Adicionar Novo Ativo'}
        </h2>

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Ticker & Online Search */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Ticker (Código B3)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Ex: HGLG11, MXRF11"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchOnline}
                disabled={isSearching}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Buscar B3</span>
              </button>
            </div>
            {searchFeedback && (
              <span className="text-[11px] text-blue-400 mt-1 block">{searchFeedback}</span>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nome do Fundo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: CSHG Logística FII"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category & Segment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Segmento</label>
              <select
                value={segmentType}
                onChange={(e) => setSegmentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="Papel">Papel</option>
                <option value="Tijolo">Tijolo</option>
                <option value="Fiagro">Fiagro</option>
                <option value="ETF">ETF</option>
                <option value="Renda Fixa">Renda Fixa</option>
              </select>
            </div>
          </div>

          {/* Price, Dividend, Shares */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Últ. Dividendo</label>
              <input
                type="number"
                step="0.01"
                required
                value={lastDividend}
                onChange={(e) => setLastDividend(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Qtd Cotas</label>
              <input
                type="number"
                required
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gestora */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Gestora</label>
            <input
              type="text"
              value={gestora}
              onChange={(e) => setGestora(e.target.value)}
              placeholder="Ex: Credit Suisse Hedging-Griffo"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Tese / Resumo</label>
            <textarea
              rows={3}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Resumo da estratégia e dos diferenciais deste ativo..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
            >
              Salvar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
