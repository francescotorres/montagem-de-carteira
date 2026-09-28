import React, { useState } from 'react';
import {
  RefreshCw,
  Sliders,
  PlusCircle,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Search,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { FiiAsset } from '../types';
import { formatCurrency, formatPercent, getCategoryBadge } from '../utils/formatters';

interface PortfolioScreenProps {
  assets: FiiAsset[];
  isRefreshing: boolean;
  isDistributing: boolean;
  onDistributeValue: () => void;
  onRefreshQuotes: () => void;
  onToggleAsset: (ticker: string, isSelected: boolean) => void;
  onToggleAssetLock: (ticker: string, isLocked: boolean) => void;
  onUpdateShares: (ticker: string, shares: number) => void;
  onRemoveAsset: (ticker: string) => void;
  onEditAsset: (asset: FiiAsset) => void;
  onAddAssetClick: () => void;
  onToggleAllAssets: (activate: boolean) => void;
  onRebalance: () => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  assets,
  isRefreshing,
  isDistributing,
  onDistributeValue,
  onRefreshQuotes,
  onToggleAsset,
  onToggleAssetLock,
  onUpdateShares,
  onRemoveAsset,
  onEditAsset,
  onAddAssetClick,
  onToggleAllAssets,
  onRebalance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODAS');
  const [expandedSummary, setExpandedSummary] = useState<Record<string, boolean>>({});

  const toggleSummary = (ticker: string) => {
    setExpandedSummary((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  const categories = ['TODAS', ...Array.from(new Set(assets.map((a) => a.category)))];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.gestora.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'TODAS' || asset.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeAssets = assets.filter((a) => a.isSelected);
  const lockedAssets = activeAssets.filter((a) => a.isLocked);
  const allActive = assets.length > 0 && activeAssets.length === assets.length;

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onDistributeValue}
              disabled={isDistributing || activeAssets.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className={`w-4 h-4 ${isDistributing ? 'animate-spin' : ''}`} />
              <span>{isDistributing ? 'Calculando...' : 'Distribuir Valor'}</span>
            </button>

            <button
              onClick={onRefreshQuotes}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all border border-slate-700 hover:border-slate-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Consultando B3...' : 'Atualizar Cotações'}</span>
            </button>

            <button
              onClick={onRebalance}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all border border-slate-700 hover:border-slate-600"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Rebalancear</span>
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onToggleAllAssets(!allActive)}
              className="px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 text-xs font-medium transition-colors border border-slate-800"
            >
              {allActive ? 'Desativar Todos' : 'Ativar Todos'}
            </button>

            <button
              onClick={onAddAssetClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ticker, nome ou gestora..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info notice about Locked Assets if any */}
      {lockedAssets.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>{lockedAssets.length} ativo(s) com valor travado:</strong> O montante alocado neles não será alterado ao clicar em "Distribuir Valor".
          </span>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => {
          const badge = getCategoryBadge(asset.category);
          const totalVal = asset.shares * asset.currentPrice;
          const monthlyInc = asset.shares * asset.lastDividend;
          const monthlyDY = asset.currentPrice > 0 ? (asset.lastDividend / asset.currentPrice) * 100 : 0;
          const isExpanded = !!expandedSummary[asset.ticker];

          return (
            <div
              key={asset.ticker}
              className={`rounded-2xl transition-all duration-200 border p-5 relative overflow-hidden backdrop-blur-sm ${
                !asset.isSelected
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-50'
                  : asset.isLocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700/80 shadow-md'
              }`}
            >
              {/* Header: Toggle, Ticker, Name, Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={asset.isSelected}
                    onChange={(e) => onToggleAsset(asset.ticker, e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white tracking-wide">{asset.ticker}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${badge.bg} ${badge.border}`}>
                        {asset.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {asset.segmentType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{asset.name}</p>
                  </div>
                </div>

                {/* Actions: Lock, Edit, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleAssetLock(asset.ticker, !asset.isLocked)}
                    title={asset.isLocked ? 'Valor Travado (clique para destravar)' : 'Travar Valor na Distribuição'}
                    className={`p-1.5 rounded-lg border transition-all ${
                      asset.isLocked
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {asset.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onEditAsset(asset)}
                    title="Editar Ativo"
                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remover ${asset.ticker} da carteira?`)) {
                        onRemoveAsset(asset.ticker);
                      }
                    }}
                    title="Excluir Ativo"
                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price, Yield & Dividend Metrics */}
              <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-[11px] text-slate-500 block">Cotação Atual</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(asset.currentPrice)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Último Provento</span>
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(asset.lastDividend)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">DY Estimado</span>
                  <span className="text-sm font-semibold text-cyan-400">{formatPercent(monthlyDY)} a.m.</span>
                </div>
              </div>

              {/* Shares allocation & Values */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                {/* Stepper Cotas */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Qtd Cotas:</span>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateShares(asset.ticker, Math.max(0, asset.shares - 10))}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => onUpdateShares(asset.ticker, Math.max(0, asset.shares - 1))}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={asset.shares}
                      onChange={(e) => onUpdateShares(asset.ticker, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-center bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                    <button
                      onClick={() => onUpdateShares(asset.ticker, asset.shares + 1)}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onUpdateShares(asset.ticker, asset.shares + 10)}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Alocado:</span>
                  <div className="text-base font-bold text-white">{formatCurrency(totalVal)}</div>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    +{formatCurrency(monthlyInc)}/mês
                  </span>
                </div>
              </div>

              {/* Tese / Summary Accordion */}
              {asset.summaryText && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => toggleSummary(asset.ticker)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-300 font-medium transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tese do Ativo & Gestora ({asset.gestora || 'Gestão Ativa'})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-fadeIn">
                      {asset.summaryText}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800/60 p-8">
          <p className="text-slate-400 text-sm">Nenhum ativo encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};
