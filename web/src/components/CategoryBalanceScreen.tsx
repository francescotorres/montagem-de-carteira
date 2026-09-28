import React from 'react';
import type { CategoryTarget, FiiAsset, PortfolioConfig } from '../types';
import { formatCurrency, formatPercent, getCategoryBadge } from '../utils/formatters';
import { Sliders, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { PROFILE_RULES } from '../services/balancingEngine';

interface CategoryBalanceScreenProps {
  assets: FiiAsset[];
  config: PortfolioConfig;
  categoryTargets: CategoryTarget[];
  onUpdateTargets: (targets: CategoryTarget[]) => void;
  onRebalance: () => void;
}

export const CategoryBalanceScreen: React.FC<CategoryBalanceScreenProps> = ({
  assets,
  config,
  categoryTargets,
  onUpdateTargets,
  onRebalance,
}) => {
  const longTermCapital = Math.max(0, config.totalToInvest - config.reserveFund);
  const activeAssets = assets.filter((a) => a.isSelected);
  const totalInvested = activeAssets.reduce((sum, a) => sum + a.shares * a.currentPrice, 0);

  const totalTargetPercent = categoryTargets.reduce((sum, t) => sum + t.targetPercentage, 0);
  const isTargetValid = Math.abs(totalTargetPercent - 100.0) < 0.1;

  const handlePercentChange = (categoryName: string, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercent * 10) / 10));
    const updated = categoryTargets.map((t) =>
      t.categoryName === categoryName ? { ...t, targetPercentage: clamped } : t
    );
    onUpdateTargets(updated);
  };

  const applyProfileDefaultTargets = () => {
    const rule = PROFILE_RULES[config.investorProfile];
    const newTargets = Object.entries(rule.categoryWeights).map(([categoryName, targetPercentage]) => ({
      categoryName,
      targetPercentage,
    }));
    onUpdateTargets(newTargets);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status of Target Total */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>Balanceamento por Categoria</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ajuste as metas percentuais de cada classe de ativo para manter o risco sob controle.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyProfileDefaultTargets}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Restaurar Metas do Perfil ({config.investorProfile})</span>
            </button>

            <button
              onClick={onRebalance}
              disabled={!isTargetValid}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Rebalancear Carteira</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTargetValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className={`text-xs font-semibold ${isTargetValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              Soma das Metas: {formatPercent(totalTargetPercent, 1)}
            </span>
            {!isTargetValid && (
              <span className="text-[11px] text-amber-300/80 hidden sm:inline">
                (A soma de todas as categorias deve atingir 100%)
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Total Disponível: <strong className="text-white">{formatCurrency(longTermCapital)}</strong>
          </div>
        </div>
      </div>

      {/* Categories List with Progress and Sliders */}
      <div className="space-y-4">
        {categoryTargets.map((target) => {
          const badge = getCategoryBadge(target.categoryName);
          const catAssets = activeAssets.filter((a) => a.category === target.categoryName);
          const currentCatValue = catAssets.reduce((sum, a) => sum + a.shares * a.currentPrice, 0);
          const currentCatPercent = totalInvested > 0 ? (currentCatValue / totalInvested) * 100 : 0;
          const targetValue = longTermCapital * (target.targetPercentage / 100.0);
          const diffValue = targetValue - currentCatValue;

          return (
            <div
              key={target.categoryName}
              className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-md backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge.bg} ${badge.border}`}>
                    {target.categoryName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {catAssets.length} ativo(s) ativo(s)
                  </span>
                </div>

                {/* Percentage stepper & direct control */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Meta:</span>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => handlePercentChange(target.categoryName, target.targetPercentage - 1)}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      -1%
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={target.targetPercentage}
                      onChange={(e) =>
                        handlePercentChange(target.categoryName, parseFloat(e.target.value) || 0)
                      }
                      className="w-16 text-center bg-transparent text-sm font-bold text-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handlePercentChange(target.categoryName, target.targetPercentage + 1)}
                      className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-semibold"
                    >
                      +1%
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider for smooth dragging */}
              <div className="my-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={target.targetPercentage}
                  onChange={(e) => handlePercentChange(target.categoryName, parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
              </div>

              {/* Visual Progress Bar (Current vs Target) */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>
                    Alocado: <strong className="text-white">{formatCurrency(currentCatValue)}</strong> ({formatPercent(currentCatPercent, 1)})
                  </span>
                  <span>
                    Meta: <strong className="text-blue-400">{formatCurrency(targetValue)}</strong> ({formatPercent(target.targetPercentage, 1)})
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, currentCatPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-slate-500">
                    Ativos:{' '}
                    {catAssets.map((a) => a.ticker).join(', ') || 'Nenhum ativo selecionado'}
                  </span>
                  <span
                    className={`font-medium ${
                      Math.abs(diffValue) < 100
                        ? 'text-emerald-400'
                        : diffValue > 0
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {Math.abs(diffValue) < 100
                      ? 'Equilibrado'
                      : diffValue > 0
                      ? `Faltam ${formatCurrency(diffValue)}`
                      : `Excesso de ${formatCurrency(Math.abs(diffValue))}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
