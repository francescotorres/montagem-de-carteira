import React from 'react';
import { User, Calendar, ShieldCheck, Wallet, Edit3 } from 'lucide-react';
import type { PortfolioConfig } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateIdealReserve, getIdealReserveMonths } from '../services/balancingEngine';

interface ClientConfigCardProps {
  config: PortfolioConfig;
  onEditClick: () => void;
}

export const ClientConfigCard: React.FC<ClientConfigCardProps> = ({ config, onEditClick }) => {
  const longTermValue = Math.max(0, config.totalToInvest - config.reserveFund);
  const idealMonths = getIdealReserveMonths(config.employmentType);
  const idealReserve = calculateIdealReserve(config.monthlyExpenses, config.employmentType);
  const reserveDiff = config.reserveFund - idealReserve;
  const isReserveSufficient = reserveDiff >= 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{config.clientName}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {config.employmentType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Planejamento gerado em {config.dateStr}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium transition-all border border-slate-700/60 hover:border-blue-500/50"
        >
          <Edit3 className="w-4 h-4 text-blue-400" />
          <span>Editar Parâmetros</span>
        </button>
      </div>

      {/* Grid with 3 Financial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Total to Invest */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Patrimônio Total</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {formatCurrency(config.totalToInvest)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Capital integral disponível
          </span>
        </div>

        {/* Emergency Reserve */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Reserva de Emergência</span>
            <ShieldCheck className={`w-4 h-4 ${isReserveSufficient ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="text-xl font-bold text-slate-100 tracking-tight">
            {formatCurrency(config.reserveFund)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                isReserveSufficient
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isReserveSufficient ? 'Adequada' : 'Abaixo do Ideal'}
            </span>
            <span className="text-[11px] text-slate-400">
              (Meta: {idealMonths}m = {formatCurrency(idealReserve)})
            </span>
          </div>
        </div>

        {/* Long Term Capital to Allocate */}
        <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/40 rounded-xl p-4">
          <div className="flex items-center justify-between text-blue-300 text-xs mb-1">
            <span className="font-medium">Alocação de Longo Prazo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              FIIs & Fiagros
            </span>
          </div>
          <div className="text-xl font-bold text-blue-400 tracking-tight">
            {formatCurrency(longTermValue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Montante distribuído nos ativos selecionados
          </span>
        </div>
      </div>
    </div>
  );
};
