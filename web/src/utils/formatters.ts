export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0) + '%';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'CRA / Fiagro': {
    bg: 'bg-emerald-50 text-emerald-800',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  'CRI / Papel': {
    bg: 'bg-blue-50 text-blue-800',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'Logística / Tijolo': {
    bg: 'bg-amber-50 text-amber-800',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  'Terras / Agrícola': {
    bg: 'bg-lime-50 text-lime-800',
    text: 'text-lime-700',
    border: 'border-lime-200',
  },
  'Shopping / Tijolo': {
    bg: 'bg-purple-50 text-purple-800',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  'ETF Mundial': {
    bg: 'bg-cyan-50 text-cyan-800',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  'Energia Alternativas': {
    bg: 'bg-teal-50 text-teal-800',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
  'ETF Renda Fixa': {
    bg: 'bg-indigo-50 text-indigo-800',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
};

export function getCategoryBadge(category: string) {
  return (
    CATEGORY_COLORS[category] || {
      bg: 'bg-slate-100 text-slate-800',
      text: 'text-slate-700',
      border: 'border-slate-200',
    }
  );
}
