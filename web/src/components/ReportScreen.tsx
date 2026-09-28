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
      <div className="no-print bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Relatório Executivo da Carteira</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gere o documento final completo para apresentação e acompanhamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all border border-slate-700 hover:border-slate-600"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Relatório'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/25"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="print-card bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 block mb-1">
              Planejamento Patrimonial
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Relatório de Alocação de Ativos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Fundos Imobiliários, Fiagros e ETFs de Renda Fixa / Ações Globais
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-1 sm:text-right">
            <div className="text-slate-400">
              Cliente: <strong className="text-white">{config.clientName}</strong>
            </div>
            <div className="text-slate-400">
              Data: <strong className="text-white">{config.dateStr}</strong>
            </div>
            <div className="text-slate-400">
              Perfil: <strong className="text-blue-400">{PROFILE_RULES[config.investorProfile].title}</strong>
            </div>
          </div>
        </div>

        {/* Financial Health & Emergency Diagnosis */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Diagnóstico do Fundo de Emergência</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Custo de Vida Mensal</span>
              <strong className="text-sm text-white">{formatCurrency(config.monthlyExpenses)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Reserva Constituída</span>
              <strong className="text-sm text-slate-200">{formatCurrency(config.reserveFund)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Meta Recomendada ({idealMonths} meses)</span>
              <strong className="text-sm text-blue-400">{formatCurrency(idealReserve)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Status da Proteção</span>
              <span
                className={`inline-block px-2 py-0.5 rounded font-semibold text-xs ${
                  isReserveSufficient
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isReserveSufficient ? 'Reserva Confortável' : 'Abaixo do Recomendado'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Total Investido</span>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">
              {formatCurrency(totalInvested)}
            </div>
            <span className="text-[10px] text-slate-400">{totalShares} cotas totais</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Renda Mensal Estimada</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <span className="text-[10px] text-emerald-500">Proventos isentos de IR</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Renda Anual Projetada</span>
            <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-1">
              {formatCurrency(totalAnnualIncome)}
            </div>
            <span className="text-[10px] text-slate-400">12 meses de proventos</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-[11px] text-slate-500 block">Dividend Yield Médio</span>
            <div className="text-lg sm:text-xl font-bold text-indigo-400 mt-1">
              {formatPercent(avgYield)} a.m.
            </div>
            <span className="text-[10px] text-slate-400">~{formatPercent(avgYield * 12)} a.a.</span>
          </div>
        </div>

        {/* Detailed Asset Allocation Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Composição Detalhada dos Ativos</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60">
                {activeAssets.map((asset) => {
                  const subtotal = asset.shares * asset.currentPrice;
                  const renda = asset.shares * asset.lastDividend;
                  const dy = asset.currentPrice > 0 ? (asset.lastDividend / asset.currentPrice) * 100 : 0;
                  const badge = getCategoryBadge(asset.category);

                  return (
                    <tr key={asset.ticker} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-white">{asset.ticker}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border}`}>
                          {asset.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-slate-200">{asset.shares}</td>
                      <td className="p-3 text-right text-slate-300">{formatCurrency(asset.currentPrice)}</td>
                      <td className="p-3 text-right font-semibold text-white">{formatCurrency(subtotal)}</td>
                      <td className="p-3 text-right text-emerald-400">{formatCurrency(asset.lastDividend)}</td>
                      <td className="p-3 text-right font-semibold text-emerald-400">+{formatCurrency(renda)}</td>
                      <td className="p-3 text-right text-cyan-400">{formatPercent(dy)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900/90 font-bold text-white border-t border-slate-800">
                <tr>
                  <td className="p-3" colSpan={2}>
                    Total ({activeAssets.length} ativos)
                  </td>
                  <td className="p-3 text-right font-mono">{totalShares}</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-blue-400">{formatCurrency(totalInvested)}</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-emerald-400">+{formatCurrency(totalMonthlyIncome)}</td>
                  <td className="p-3 text-right text-cyan-400">{formatPercent(avgYield)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Educational Terms / Dicionário do Investidor */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Guia Educacional: Dicionário do Investidor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EDUCATIONAL_TERMS.map((item) => (
              <div
                key={item.term}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs"
              >
                <strong className="text-blue-400 block mb-1 text-sm font-semibold">
                  {item.term}
                </strong>
                <p className="text-slate-300 leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
