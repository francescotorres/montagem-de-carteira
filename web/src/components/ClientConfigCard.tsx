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
    <div className="neo-card rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center neo-button">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{config.clientName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {config.employmentType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Planejamento gerado em {config.dateStr}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl neo-button text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-semibold transition-all"
        >
          <Edit3 className="w-4 h-4 text-blue-600" />
          <span>Editar Parâmetros</span>
        </button>
      </div>

      {/* Grid with 3 Financial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Total to Invest */}
        <div className="neo-inset rounded-xl p-4 border border-blue-100/80">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Patrimônio Total</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-850 tracking-tight">
            {formatCurrency(config.totalToInvest)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Capital integral disponível
          </span>
        </div>

        {/* Emergency Reserve */}
        <div className="neo-inset rounded-xl p-4 border border-blue-100/80">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Reserva de Emergência</span>
            <ShieldCheck className={`w-4 h-4 ${isReserveSufficient ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
          <div className="text-xl font-bold text-slate-800 tracking-tight">
            {formatCurrency(config.reserveFund)}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                isReserveSufficient
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isReserveSufficient ? 'Adequada' : 'Abaixo do Ideal'}
            </span>
            <span className="text-[10px] text-slate-500">
              (Meta: {idealMonths}m = {formatCurrency(idealReserve)})
            </span>
          </div>
        </div>

        {/* Long Term Capital to Allocate */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl p-4 border border-blue-200/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-800 text-xs mb-1">
            <span className="font-bold">Alocação de Longo Prazo</span>
          </div>
          <div className="text-xl font-extrabold text-blue-700 tracking-tight">
            {formatCurrency(longTermValue)}
          </div>
          <span className="text-[11px] text-blue-900/70 mt-1 block font-medium">
            Montante distribuído nos ativos selecionados
          </span>
        </div>
      </div>
    </div>
  );
};
