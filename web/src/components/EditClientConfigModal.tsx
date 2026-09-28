import React, { useState } from 'react';
import type { PortfolioConfig, EmploymentType, InvestorProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateIdealReserve, getIdealReserveMonths } from '../services/balancingEngine';
import { X } from 'lucide-react';

interface EditClientConfigModalProps {
  initialConfig: PortfolioConfig;
  onDismiss: () => void;
  onSave: (config: PortfolioConfig) => void;
}

export const EditClientConfigModal: React.FC<EditClientConfigModalProps> = ({
  initialConfig,
  onDismiss,
  onSave,
}) => {
  const [clientName, setClientName] = useState(initialConfig.clientName);
  const [dateStr, setDateStr] = useState(initialConfig.dateStr);
  const [totalToInvest, setTotalToInvest] = useState(initialConfig.totalToInvest.toString());
  const [reserveFund, setReserveFund] = useState(initialConfig.reserveFund.toString());
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialConfig.monthlyExpenses.toString());
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialConfig.employmentType);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>(initialConfig.investorProfile);

  const numExpenses = parseFloat(monthlyExpenses) || 0;
  const numReserve = parseFloat(reserveFund) || 0;
  const numTotal = parseFloat(totalToInvest) || 0;
  const idealMonths = getIdealReserveMonths(employmentType);
  const idealReserveVal = calculateIdealReserve(numExpenses, employmentType);
  const longTermVal = Math.max(0, numTotal - numReserve);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...initialConfig,
      clientName: clientName.trim() || 'FULANO',
      dateStr: dateStr.trim() || new Date().toLocaleDateString('pt-BR'),
      totalToInvest: numTotal,
      reserveFund: numReserve,
      monthlyExpenses: numExpenses,
      employmentType,
      investorProfile,
    });
  };

  const applySuggestedReserve = () => {
    setReserveFund(idealReserveVal.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f5f8fd] border border-white neo-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative animate-scaleUp">
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl neo-button"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-slate-850 mb-4">Editar Parâmetros do Cliente</h2>

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          {/* Client Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nome do Cliente</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Data do Planejamento</label>
              <input
                type="text"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Employment Type & Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Tipo de Ocupação
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="CLT">CLT (Recomendado 6 meses)</option>
                <option value="AUTONOMO">Autônomo / PJ (Recomendado 6 meses)</option>
                <option value="SERVIDOR">Servidor Público (Recomendado 3 meses)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Perfil de Investidor
              </label>
              <select
                value={investorProfile}
                onChange={(e) => setInvestorProfile(e.target.value as InvestorProfile)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="CONSERVADOR">Conservador</option>
                <option value="MODERADO">Moderado</option>
                <option value="AGRESSIVO">Agressivo</option>
              </select>
            </div>
          </div>

          {/* Financial Inputs: Expenses, Total, Reserve */}
          <div className="space-y-3 pt-2 border-t border-blue-100">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Custo de Vida / Despesas Mensais (R$)
              </label>
              <input
                type="number"
                step="100"
                required
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600">
                  Fundo de Reserva Atual (R$)
                </label>
                <button
                  type="button"
                  onClick={applySuggestedReserve}
                  className="text-[11px] text-blue-700 font-bold hover:underline"
                >
                  Usar meta ideal ({formatCurrency(idealReserveVal)})
                </button>
              </div>
              <input
                type="number"
                step="500"
                required
                value={reserveFund}
                onChange={(e) => setReserveFund(e.target.value)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Meta ideal para {employmentType}: {idealMonths} meses = {formatCurrency(idealReserveVal)}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Patrimônio Total a Alocar (R$)
              </label>
              <input
                type="number"
                step="1000"
                required
                value={totalToInvest}
                onChange={(e) => setTotalToInvest(e.target.value)}
                className="w-full px-3 py-2 neo-inset rounded-xl text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Long term preview in Neo-Inset */}
          <div className="p-3.5 rounded-xl neo-inset border border-blue-100 text-xs">
            <span className="text-slate-500 block font-medium">Montante Efetivo para FIIs e Fiagros:</span>
            <span className="text-base font-extrabold text-blue-700">{formatCurrency(longTermVal)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-blue-100">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 neo-button text-slate-600 rounded-xl font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 neo-button-primary rounded-xl font-bold text-xs"
            >
              Salvar Parâmetros
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
