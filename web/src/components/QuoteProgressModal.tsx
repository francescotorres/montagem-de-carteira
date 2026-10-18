import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, ShieldCheck, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export interface TickerProgressState {
  ticker: string;
  name?: string;
  status: 'pending' | 'updating' | 'completed' | 'error';
  currentPrice?: number;
  previousPrice?: number;
  source?: 'GOOGLE_FINANCE' | 'BORA_INVESTIR' | 'CACHE_FALLBACK' | string;
  error?: string;
}

interface QuoteProgressModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  currentIndex: number;
  totalTickers: number;
  currentTicker: string;
  items: TickerProgressState[];
  isComplete: boolean;
  onCancel?: () => void;
}

export const QuoteProgressModal: React.FC<QuoteProgressModalProps> = ({
  isOpen,
  onDismiss,
  currentIndex,
  totalTickers,
  currentTicker,
  items,
  isComplete,
  onCancel,
}) => {
  if (!isOpen) return null;

  const progressPercent = totalTickers > 0
    ? Math.min(100, Math.round(((isComplete ? totalTickers : Math.max(0, currentIndex - 1)) / totalTickers) * 100))
    : 0;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const errorCount = items.filter((i) => i.status === 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-blue-50 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <RefreshCw className={`w-5 h-5 ${!isComplete ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-bold text-slate-800">
                {isComplete ? 'Cotações Atualizadas!' : 'Atualizando Cotações na B3'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isComplete
                  ? `${completedCount} de ${totalTickers} ativo(s) sincronizado(s)`
                  : 'Roteando via Bora Investir (B3) e Google Finance'}
              </p>
            </div>
          </div>

          {isComplete && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Overview */}
        <div className="p-5 bg-slate-50/70 border-b border-blue-50 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">
              {isComplete
                ? 'Concluído com sucesso'
                : currentTicker
                ? `Atualizando ${currentTicker} (${currentIndex}/${totalTickers})`
                : 'Iniciando consulta...'}
            </span>
            <span className="text-blue-700 font-bold">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedCount} atualizado(s)
              </span>
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorCount} com fallback
                </span>
              )}
            </div>
            <span>Total: {totalTickers} ativos</span>
          </div>
        </div>

        {/* Ticker Progress Items List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {items.map((item) => {
            const isTargetBora = item.ticker === 'SPYI11' || item.ticker === 'LFIX11';
            const sourceLabel = item.source === 'BORA_INVESTIR'
              ? 'Bora Investir'
              : item.source === 'GOOGLE_FINANCE'
              ? 'Google Finance'
              : item.source === 'CACHE_FALLBACK'
              ? 'Cache Fallback'
              : isTargetBora
              ? 'Bora Investir'
              : 'Google Finance';

            return (
              <div
                key={item.ticker}
                className={`pt-2 first:pt-0 flex items-center justify-between py-2 px-3 rounded-xl transition-all ${
                  item.status === 'updating'
                    ? 'bg-blue-50/70 border border-blue-200 shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {item.status === 'updating' && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    )}
                    {item.status === 'completed' && item.source !== 'CACHE_FALLBACK' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {item.status === 'completed' && item.source === 'CACHE_FALLBACK' && (
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {item.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.ticker}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isTargetBora
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {sourceLabel}
                      </span>
                    </div>
                    {item.name && (
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.name}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {item.currentPrice ? (
                    <span className="text-xs font-bold text-slate-800">
                      {formatCurrency(item.currentPrice)}
                    </span>
                  ) : item.previousPrice ? (
                    <span className="text-xs text-slate-400">
                      {formatCurrency(item.previousPrice)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Aguardando...</span>
                  )}
                  {item.status === 'completed' && item.previousPrice && item.currentPrice && (
                    <p className="text-[10px] text-slate-400">
                      Anterior: {formatCurrency(item.previousPrice)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          {!isComplete && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl neo-button text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
          )}

          {isComplete ? (
            <button
              onClick={onDismiss}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              Concluir
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Atualizando dados em tempo real...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
