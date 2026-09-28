import React, { useState } from 'react';
import type { FiiAsset, PortfolioConfig, CategoryTarget } from '../types';
import { formatCurrency, formatPercent, getCategoryBadge } from '../utils/formatters';
import { EDUCATIONAL_TERMS } from '../data/defaultData';
import { calculateIdealReserve, getIdealReserveMonths, PROFILE_RULES } from '../services/balancingEngine';
import {
  FileText,
  Copy,
  Check,
  Share2,
  Printer,
  ShieldCheck,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

interface ReportScreenProps {
  assets: FiiAsset[];
  config: PortfolioConfig;
  categoryTargets: CategoryTarget[];
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ assets, config, categoryTargets }) => {
  const [copied, setCopied] = useState(false);

  const activeAssets = assets.filter((a) => a.isSelected);
  const totalInvested = activeAssets.reduce((sum, a) => sum + a.shares * a.currentPrice, 0);
  const totalMonthlyIncome = activeAssets.reduce((sum, a) => sum + a.shares * a.lastDividend, 0);
  const totalAnnualIncome = totalMonthlyIncome * 12.0;
  const avgYield = totalInvested > 0 ? (totalMonthlyIncome / totalInvested) * 100 : 0;
  const totalShares = activeAssets.reduce((sum, a) => sum + a.shares, 0);

  const idealMonths = getIdealReserveMonths(config.employmentType);
  const idealReserve = calculateIdealReserve(config.monthlyExpenses, config.employmentType);
  const isReserveSufficient = config.reserveFund >= idealReserve;

  // Build formatted text for clipboard & WhatsApp
  const buildReportText = () => {
    let text = `*RELATÓRIO DE PLANEJAMENTO E CARTEIRA RECOMENDADA*\n`;
    text += `Cliente: ${config.clientName}\n`;
    text += `Data: ${config.dateStr}\n`;
    text += `Perfil de Risco: ${PROFILE_RULES[config.investorProfile].title}\n`;
    text += `Ocupação: ${config.employmentType}\n\n`;

    text += `*DIAGNÓSTICO FINANCEIRO & RESERVA*\n`;
    text += `• Despesas Mensais: ${formatCurrency(config.monthlyExpenses)}\n`;
    text += `• Reserva Atual: ${formatCurrency(config.reserveFund)} (${(config.reserveFund / (config.monthlyExpenses || 1)).toFixed(1)} meses)\n`;
    text += `• Reserva Recomendada: ${formatCurrency(idealReserve)} (${idealMonths} meses)\n`;
    text += `• Diagnóstico: ${isReserveSufficient ? 'Reserva Adequada ✅' : 'Necessita Complementação ⚠️'}\n\n`;

    text += `*RESUMO DA CARTEIRA DE FIIS & FIAGROS*\n`;
    text += `• Total Investido: ${formatCurrency(totalInvested)}\n`;
    text += `• Total de Cotas: ${totalShares}\n`;
    text += `• Renda Mensal Estimada: ${formatCurrency(totalMonthlyIncome)}\n`;
    text += `• Renda Anual Projetada: ${formatCurrency(totalAnnualIncome)}\n`;
    text += `• Dividend Yield Médio: ${formatPercent(avgYield)} a.m. (${formatPercent(avgYield * 12)} a.a.)\n\n`;

    text += `*ATIVOS SELECIONADOS:*\n`;
    activeAssets.forEach((a) => {
      const subtotal = a.shares * a.currentPrice;
      const renda = a.shares * a.lastDividend;
      text += `• ${a.ticker} (${a.category}): ${a.shares} cotas x ${formatCurrency(a.currentPrice)} = ${formatCurrency(subtotal)} | Renda: ${formatCurrency(renda)}/mês\n`;
    });

    text += `\n*DISTRIBUIÇÃO POR CATEGORIA:*\n`;
    categoryTargets.forEach((t) => {
      const catAssets = activeAssets.filter((a) => a.category === t.categoryName);
      const catVal = catAssets.reduce((sum, a) => sum + a.shares * a.currentPrice, 0);
      const catPct = totalInvested > 0 ? (catVal / totalInvested) * 100 : 0;
      text += `• ${t.categoryName}: ${formatPercent(catPct, 1)} (Meta: ${formatPercent(t.targetPercentage, 1)})\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildReportText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print neo-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Relatório Executivo da Carteira</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gere o documento final completo para apresentação e acompanhamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl neo-button text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-semibold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/25"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl neo-button-primary text-xs sm:text-sm font-bold transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="print-card neo-card rounded-2xl p-6 sm:p-8 space-y-8">
        {/* Document Header */}
        <div className="border-b border-blue-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-700 block mb-1">
              Planejamento Patrimonial
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-850 tracking-tight">
              Relatório de Alocação de Ativos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Fundos Imobiliários, Fiagros e ETFs de Renda Fixa / Ações Globais
            </p>
          </div>

          <div className="neo-inset p-4 rounded-xl border border-blue-100 text-xs space-y-1 sm:text-right">
            <div className="text-slate-600 font-medium">
              Cliente: <strong className="text-slate-800">{config.clientName}</strong>
            </div>
            <div className="text-slate-600 font-medium">
              Data: <strong className="text-slate-800">{config.dateStr}</strong>
            </div>
            <div className="text-slate-600 font-medium">
              Perfil: <strong className="text-blue-700">{PROFILE_RULES[config.investorProfile].title}</strong>
            </div>
          </div>
        </div>

        {/* Financial Health & Emergency Diagnosis */}
        <div className="neo-inset rounded-xl p-5 border border-blue-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Diagnóstico do Fundo de Emergência</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Custo de Vida Mensal</span>
              <strong className="text-sm text-slate-800">{formatCurrency(config.monthlyExpenses)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Reserva Constituída</span>
              <strong className="text-sm text-slate-800">{formatCurrency(config.reserveFund)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Meta Recomendada ({idealMonths} meses)</span>
              <strong className="text-sm text-blue-700">{formatCurrency(idealReserve)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1 font-medium">Status da Proteção</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  isReserveSufficient
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {isReserveSufficient ? 'Reserva Confortável' : 'Abaixo do Recomendado'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="neo-inset rounded-xl p-4 border border-blue-100">
            <span className="text-[11px] text-slate-500 block font-medium">Total Investido</span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
              {formatCurrency(totalInvested)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{totalShares} cotas totais</span>
          </div>

          <div className="neo-inset rounded-xl p-4 border border-blue-100">
            <span className="text-[11px] text-slate-500 block font-medium">Renda Mensal Estimada</span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-600 mt-1">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Proventos isentos de IR</span>
          </div>

          <div className="neo-inset rounded-xl p-4 border border-blue-100">
            <span className="text-[11px] text-slate-500 block font-medium">Renda Anual Projetada</span>
            <div className="text-lg sm:text-xl font-extrabold text-blue-700 mt-1">
              {formatCurrency(totalAnnualIncome)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">12 meses de proventos</span>
          </div>

          <div className="neo-inset rounded-xl p-4 border border-blue-100">
            <span className="text-[11px] text-slate-500 block font-medium">Dividend Yield Médio</span>
            <div className="text-lg sm:text-xl font-extrabold text-indigo-700 mt-1">
              {formatPercent(avgYield)} a.m.
            </div>
            <span className="text-[10px] text-slate-500 font-medium">~{formatPercent(avgYield * 12)} a.a.</span>
          </div>
        </div>

        {/* Detailed Asset Allocation Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Composição Detalhada dos Ativos</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-blue-200/80 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-blue-50/70 text-slate-700 uppercase tracking-wider text-[11px] border-b border-blue-200">
                <tr>
                  <th className="p-3">Ativo</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Cotas</th>
                  <th className="p-3 text-right">Preço</th>
                  <th className="p-3 text-right">Total Alocado</th>
                  <th className="p-3 text-right">Provento</th>
                  <th className="p-3 text-right">Renda/Mês</th>
                  <th className="p-3 text-right">DY a.m.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {activeAssets.map((asset) => {
                  const subtotal = asset.shares * asset.currentPrice;
                  const renda = asset.shares * asset.lastDividend;
                  const dy = asset.currentPrice > 0 ? (asset.lastDividend / asset.currentPrice) * 100 : 0;
                  const badge = getCategoryBadge(asset.category);

                  return (
                    <tr key={asset.ticker} className="hover:bg-blue-50/40">
                      <td className="p-3 font-bold text-slate-800">{asset.ticker}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.border}`}>
                          {asset.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">{asset.shares}</td>
                      <td className="p-3 text-right text-slate-700">{formatCurrency(asset.currentPrice)}</td>
                      <td className="p-3 text-right font-bold text-slate-850">{formatCurrency(subtotal)}</td>
                      <td className="p-3 text-right text-emerald-600 font-semibold">{formatCurrency(asset.lastDividend)}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">+{formatCurrency(renda)}</td>
                      <td className="p-3 text-right font-semibold text-blue-700">{formatPercent(dy)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-blue-50/90 font-bold text-slate-800 border-t border-blue-200">
                <tr>
                  <td className="p-3" colSpan={2}>
                    Total ({activeAssets.length} ativos)
                  </td>
                  <td className="p-3 text-right font-mono">{totalShares}</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-blue-700 font-extrabold">{formatCurrency(totalInvested)}</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-emerald-600 font-extrabold">+{formatCurrency(totalMonthlyIncome)}</td>
                  <td className="p-3 text-right text-blue-700 font-extrabold">{formatPercent(avgYield)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Educational Terms / Dicionário do Investidor */}
        <div className="space-y-4 pt-4 border-t border-blue-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Guia Educacional: Dicionário do Investidor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EDUCATIONAL_TERMS.map((item) => (
              <div
                key={item.term}
                className="neo-inset rounded-xl p-4 text-xs border border-blue-100"
              >
                <strong className="text-blue-700 block mb-1 text-sm font-bold">
                  {item.term}
                </strong>
                <p className="text-slate-700 leading-relaxed font-medium">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
