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
      <div className="neo-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onDistributeValue}
              disabled={isDistributing || activeAssets.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl neo-button-primary text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isDistributing ? 'animate-spin' : ''}`} />
              <span>{isDistributing ? 'Calculando...' : 'Distribuir Valor'}</span>
            </button>

            <button
              onClick={onRefreshQuotes}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl neo-button text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Consultando B3...' : 'Atualizar Cotações'}</span>
            </button>

            <button
              onClick={onRebalance}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl neo-button text-slate-700 hover:text-emerald-700 text-xs sm:text-sm font-semibold"
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Rebalancear</span>
            </button>
          </div>

          {/* Secondary Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onToggleAllAssets(!allActive)}
              className="px-3.5 py-2 rounded-xl neo-button text-slate-700 text-xs font-semibold"
            >
              {allActive ? 'Desativar Todos' : 'Ativar Todos'}
            </button>

            <button
              onClick={onAddAssetClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Ativo</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-blue-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ticker, nome ou gestora..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all neo-inset"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-500 neo-button"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info notice about Locked Assets if any */}
      {lockedAssets.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium shadow-sm">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
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
              className={`rounded-2xl transition-all duration-200 p-5 relative overflow-hidden ${
                !asset.isSelected
                  ? 'bg-slate-100/60 border border-slate-200 opacity-60'
                  : asset.isLocked
                  ? 'neo-card border-amber-300 ring-2 ring-amber-100 shadow-md'
                  : 'neo-card hover:border-blue-300'
              }`}
            >
              {/* Header: Toggle, Ticker, Name, Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={asset.isSelected}
                    onChange={(e) => onToggleAsset(asset.ticker, e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-slate-800 tracking-wide">{asset.ticker}</span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.border}`}>
                        {asset.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
                        {asset.segmentType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{asset.name}</p>
                  </div>
                </div>

                {/* Actions: Lock, Edit, Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleAssetLock(asset.ticker, !asset.isLocked)}
                    title={asset.isLocked ? 'Valor Travado (clique para destravar)' : 'Travar Valor na Distribuição'}
                    className={`p-1.5 rounded-lg border transition-all ${
                      asset.isLocked
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'neo-button text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {asset.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onEditAsset(asset)}
                    title="Editar Ativo"
                    className="p-1.5 rounded-lg neo-button text-slate-500 hover:text-blue-700 transition-colors"
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
                    className="p-1.5 rounded-lg neo-button text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price, Yield & Dividend Metrics in Neo-Inset */}
              <div className="grid grid-cols-3 gap-2 mt-4 neo-inset p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Cotação Atual</span>
                  <span className="text-sm font-bold text-slate-800">{formatCurrency(asset.currentPrice)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Último Provento</span>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(asset.lastDividend)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">DY Estimado</span>
                  <span className="text-sm font-bold text-blue-600">{formatPercent(monthlyDY)} a.m.</span>
                </div>
              </div>

              {/* Shares allocation & Values */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-blue-100">
                {/* Stepper Cotas */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">Qtd Cotas:</span>
                  <div className="flex items-center neo-inset rounded-lg p-0.5 border border-blue-200">
                    <button
                      onClick={() => onUpdateShares(asset.ticker, Math.max(0, asset.shares - 10))}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => onUpdateShares(asset.ticker, Math.max(0, asset.shares - 1))}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={asset.shares}
                      onChange={(e) => onUpdateShares(asset.ticker, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-center bg-transparent text-sm font-extrabold text-slate-800 focus:outline-none"
                    />
                    <button
                      onClick={() => onUpdateShares(asset.ticker, asset.shares + 1)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onUpdateShares(asset.ticker, asset.shares + 10)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Subtotals */}
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block font-medium">Total Alocado:</span>
                  <div className="text-base font-extrabold text-slate-850">{formatCurrency(totalVal)}</div>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    +{formatCurrency(monthlyInc)}/mês
                  </span>
                </div>
              </div>

              {/* Tese / Summary Accordion */}
              {asset.summaryText && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => toggleSummary(asset.ticker)}
                    className="flex items-center gap-1.5 text-[11px] text-blue-700 hover:text-blue-800 font-semibold transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tese do Ativo & Gestora ({asset.gestora || 'Gestão Ativa'})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3.5 rounded-xl neo-inset text-xs text-slate-700 leading-relaxed border border-blue-100">
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
        <div className="text-center py-12 neo-card rounded-2xl p-8">
          <p className="text-slate-500 text-sm font-medium">Nenhum ativo encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};
