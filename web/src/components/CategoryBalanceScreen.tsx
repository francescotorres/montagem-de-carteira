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
      <div className="neo-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Balanceamento por Categoria</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ajuste as metas percentuais de cada classe de ativo para manter o risco sob controle.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyProfileDefaultTargets}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl neo-button text-slate-700 hover:text-blue-700 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Restaurar Metas ({config.investorProfile})</span>
            </button>

            <button
              onClick={onRebalance}
              disabled={!isTargetValid}
              className="flex items-center gap-2 px-4 py-2 rounded-xl neo-button-primary text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Rebalancear Carteira</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation Bar in Neo-Inset */}
        <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isTargetValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
            <span className={`text-xs font-bold ${isTargetValid ? 'text-emerald-700' : 'text-amber-700'}`}>
              Soma das Metas: {formatPercent(totalTargetPercent, 1)}
            </span>
            {!isTargetValid && (
              <span className="text-[11px] text-amber-600 font-medium hidden sm:inline">
                (A soma de todas as categorias deve atingir 100%)
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Disponível: <strong className="text-slate-800">{formatCurrency(longTermCapital)}</strong>
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
              className="neo-card rounded-2xl p-5 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${badge.bg} ${badge.border}`}>
                    {target.categoryName}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {catAssets.length} ativo(s) selecionado(s)
                  </span>
                </div>

                {/* Percentage stepper & direct control */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">Meta:</span>
                  <div className="flex items-center neo-inset rounded-lg p-0.5 border border-blue-200">
                    <button
                      onClick={() => handlePercentChange(target.categoryName, target.targetPercentage - 1)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
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
                      className="w-16 text-center bg-transparent text-sm font-extrabold text-blue-700 focus:outline-none"
                    />
                    <button
                      onClick={() => handlePercentChange(target.categoryName, target.targetPercentage + 1)}
                      className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded text-xs font-bold"
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
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-100 rounded-lg appearance-none"
                />
              </div>

              {/* Visual Progress Bar (Current vs Target) */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>
                    Alocado: <strong className="text-slate-800">{formatCurrency(currentCatValue)}</strong> ({formatPercent(currentCatPercent, 1)})
                  </span>
                  <span>
                    Meta: <strong className="text-blue-700">{formatCurrency(targetValue)}</strong> ({formatPercent(target.targetPercentage, 1)})
                  </span>
                </div>

                <div className="w-full bg-blue-100/80 h-3 rounded-full overflow-hidden flex border border-blue-200 neo-inset">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.min(100, currentCatPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-slate-500 font-medium">
                    Ativos:{' '}
                    {catAssets.map((a) => a.ticker).join(', ') || 'Nenhum ativo'}
                  </span>
                  <span
                    className={`font-bold ${
                      Math.abs(diffValue) < 100
                        ? 'text-emerald-600'
                        : diffValue > 0
                        ? 'text-blue-700'
                        : 'text-amber-600'
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
