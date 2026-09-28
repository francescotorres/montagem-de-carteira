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
    bg: 'bg-emerald-950/40 text-emerald-300',
    text: 'text-emerald-400',
    border: 'border-emerald-700/50',
  },
  'CRI / Papel': {
    bg: 'bg-blue-950/40 text-blue-300',
    text: 'text-blue-400',
    border: 'border-blue-700/50',
  },
  'Logística / Tijolo': {
    bg: 'bg-amber-950/40 text-amber-300',
    text: 'text-amber-400',
    border: 'border-amber-700/50',
  },
  'Terras / Agrícola': {
    bg: 'bg-lime-950/40 text-lime-300',
    text: 'text-lime-400',
    border: 'border-lime-700/50',
  },
  'Shopping / Tijolo': {
    bg: 'bg-purple-950/40 text-purple-300',
    text: 'text-purple-400',
    border: 'border-purple-700/50',
  },
  'ETF Mundial': {
    bg: 'bg-cyan-950/40 text-cyan-300',
    text: 'text-cyan-400',
    border: 'border-cyan-700/50',
  },
  'Energia Alternativas': {
    bg: 'bg-teal-950/40 text-teal-300',
    text: 'text-teal-400',
    border: 'border-teal-700/50',
  },
  'ETF Renda Fixa': {
    bg: 'bg-indigo-950/40 text-indigo-300',
    text: 'text-indigo-400',
    border: 'border-indigo-700/50',
  },
};

export function getCategoryBadge(category: string) {
  return (
    CATEGORY_COLORS[category] || {
      bg: 'bg-slate-800 text-slate-300',
      text: 'text-slate-400',
      border: 'border-slate-700',
    }
  );
}
