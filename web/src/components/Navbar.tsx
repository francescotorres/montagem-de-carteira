import React, { useState } from 'react';
import { PieChart, TrendingUp, FileText, RotateCcw, Sparkles, LogOut, Users, X } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useAuth } from '../auth/AuthContext';
import { UsersPanel } from '../auth/UsersPanel';

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
  const { user, logout } = useAuth();
  const [showUsersPanel, setShowUsersPanel] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f0f5fc]/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                  Montagem de Carteiras
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    Online
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Planejador inteligente de FIIs, Fiagros e ETFs
                </p>
              </div>
            </div>

            {/* Navigation Tabs - Neomorphic Pill */}
            <nav className="flex items-center gap-1 sm:gap-2 neo-inset p-1 rounded-xl">
              <button
                onClick={() => onSelectTab(0)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 0
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Carteira</span>
              </button>
              <button
                onClick={() => onSelectTab(1)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 1
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Balanceamento %</span>
              </button>
              <button
                onClick={() => onSelectTab(2)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === 2
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Relatório</span>
              </button>
            </nav>

            {/* Quick Metrics, Auth & Reset */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-4 text-xs neo-card px-3.5 py-1.5 rounded-xl">
                <div>
                  <span className="text-slate-500 block text-[10px]">Investido</span>
                  <span className="font-bold text-slate-800">{formatCurrency(totalInvested)}</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-500 block text-[10px]">Renda/Mês</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(monthlyIncome)}</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-slate-500 block text-[10px]">DY Médio</span>
                  <span className="font-bold text-blue-600">{formatPercent(avgYield)} a.m.</span>
                </div>
              </div>

              {/* Logged user + actions */}
              {user && (
                <div className="flex items-center gap-2">
                  {/* User avatar chip */}
                  <div className="hidden sm:flex items-center gap-2 neo-card px-3 py-1.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.nome[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{user.nome}</span>
                  </div>

                  {/* Users management button */}
                  <button
                    onClick={() => setShowUsersPanel(true)}
                    title="Gerenciar usuários"
                    className="p-2 neo-button text-blue-500 hover:text-blue-700 rounded-xl"
                  >
                    <Users className="w-4 h-4" />
                  </button>

                  {/* Logout button */}
                  <button
                    onClick={() => {
                      if (confirm('Deseja sair da sua conta?')) logout();
                    }}
                    title="Sair"
                    className="p-2 neo-button text-slate-500 hover:text-red-600 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  if (confirm('Restaurar carteira para a planilha padrão original?')) {
                    onResetDefaults();
                  }
                }}
                title="Restaurar valores padrão"
                className="p-2 neo-button text-slate-500 hover:text-slate-800 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Users Management Modal */}
      {showUsersPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(12,74,110,0.35)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowUsersPanel(false); }}
        >
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowUsersPanel(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-blue-100 shadow-md flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <UsersPanel />
          </div>
        </div>
      )}
    </>
  );
};
