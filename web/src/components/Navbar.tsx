import React from 'react';
import { PieChart, TrendingUp, FileText, RotateCcw, Sparkles } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface NavbarProps {
  currentTab: number;
  onSelectTab: (tab: number) => void;
  totalInvested: number;
  monthlyIncome: number;
  avgYield: number;
  capitalDifference?: number;
  onResetDefaults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  totalInvested,
  monthlyIncome,
  avgYield,
  onResetDefaults,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Montagem de Carteiras
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Online
                </span>
              </span>
              <p className="text-xs text-slate-400 hidden sm:block">
                Planejador inteligente de FIIs, Fiagros e ETFs
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab(0)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 0
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Carteira</span>
            </button>
            <button
              onClick={() => onSelectTab(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 1
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Balanceamento %</span>
            </button>
            <button
              onClick={() => onSelectTab(2)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 2
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatório</span>
            </button>
          </nav>

          {/* Quick Metrics & Reset */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4 text-xs bg-slate-950/50 px-3 py-1.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Investido</span>
                <span className="font-semibold text-slate-200">{formatCurrency(totalInvested)}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-500 block">Renda/Mês</span>
                <span className="font-semibold text-emerald-400">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-500 block">DY Médio</span>
                <span className="font-semibold text-cyan-400">{formatPercent(avgYield)} a.m.</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (confirm('Restaurar carteira para a planilha padrão original?')) {
                  onResetDefaults();
                }
              }}
              title="Restaurar valores padrão"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800/80"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
