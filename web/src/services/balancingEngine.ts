import type { FiiAsset, CategoryTarget, InvestorProfile, EmploymentType } from '../types';

export interface ProfileRule {
  profileCode: InvestorProfile;
  title: string;
  description: string;
  categoryWeights: Record<string, number>;
  prioritizedTickers: string[];
}

export const PROFILE_RULES: Record<InvestorProfile, ProfileRule> = {
  CONSERVADOR: {
    profileCode: 'CONSERVADOR',
    title: 'Conservador',
    description:
      'Foco em proteção do patrimônio e previsibilidade de caixa: prioriza FIIs de Papel/CRI High Grade (pós-fixados CDI e IPCA), ETF Renda Fixa e galpões logísticos defensivos.',
    categoryWeights: {
      'CRI / Papel': 45.0,
      'ETF Renda Fixa': 30.0,
      'Logística / Tijolo': 25.0,
      'CRA / Fiagro': 0.0,
      'Terras / Agrícola': 0.0,
      'Shopping / Tijolo': 0.0,
      'ETF Mundial': 0.0,
      'Energia Alternativas': 0.0,
    },
    prioritizedTickers: ['KNCR11', 'KNSC11', 'GARE11', 'LLFT11'],
  },
  MODERADO: {
    profileCode: 'MODERADO',
    title: 'Moderado',
    description:
      'Carteira equilibrada entre dividendos recorrentes de Fiagros e CRIs, aliada a valorização de tijolo (logística e shopping) e proteção macroeconômica global.',
    categoryWeights: {
      'CRI / Papel': 22.0,
      'CRA / Fiagro': 18.0,
      'Logística / Tijolo': 11.0,
      'Terras / Agrícola': 11.0,
      'Shopping / Tijolo': 11.0,
      'Energia Alternativas': 11.0,
      'ETF Mundial': 9.0,
      'ETF Renda Fixa': 7.0,
    },
    prioritizedTickers: [
      'RZAG11',
      'KNSC11',
      'KNCR11',
      'GARE11',
      'RZTR11',
      'HSML11',
      'WRLD11',
      'SNEL11',
      'LLFT11',
    ],
  },
  AGRESSIVO: {
    profileCode: 'AGRESSIVO',
    title: 'Agressivo',
    description:
      'Maximização de yield mensal e ganho de capital: alta exposição a Fiagros de CRA e terras agrícolas de alta produtividade, energia renovável e ações mundiais.',
    categoryWeights: {
      'CRA / Fiagro': 28.0,
      'Terras / Agrícola': 18.0,
      'Energia Alternativas': 18.0,
      'ETF Mundial': 16.0,
      'Shopping / Tijolo': 10.0,
      'Logística / Tijolo': 10.0,
      'CRI / Papel': 0.0,
      'ETF Renda Fixa': 0.0,
    },
    prioritizedTickers: ['RZAG11', 'RZTR11', 'SNEL11', 'WRLD11', 'HSML11', 'GARE11'],
  },
};

export function getIdealReserveMonths(employmentType: EmploymentType): number {
  return employmentType === 'SERVIDOR' ? 3 : 6;
}

export function calculateIdealReserve(monthlyExpenses: number, employmentType: EmploymentType): number {
  return monthlyExpenses * getIdealReserveMonths(employmentType);
}

/**
 * Executa a Distribuição de Valor na Ordem Estrita:
 * 1. Filtra ativos selecionados.
 * 2. Deduz o total dos ativos com 'isLocked == true'.
 * 3. O saldo restante é distribuído igualmente entre os ativos destravados.
 */
export function executeValueDistribution(
  assets: FiiAsset[],
  longTermCapital: number
): {
  updatedAssets: FiiAsset[];
  success: boolean;
  message: string;
} {
  const activeAssets = assets.filter((a) => a.isSelected);

  if (activeAssets.length === 0) {
    return {
      updatedAssets: assets,
      success: false,
      message: 'É necessário ter pelo menos um ativo selecionado!',
    };
  }

  const unlockedAssets = activeAssets.filter((a) => !a.isLocked);
  const lockedAssets = activeAssets.filter((a) => a.isLocked);

  if (unlockedAssets.length === 0) {
    return {
      updatedAssets: assets,
      success: false,
      message: 'Todos os ativos habilitados estão travados. Nenhuma alocação foi alterada.',
    };
  }

  const lockedTotalAllocated = lockedAssets.reduce(
    (sum, a) => sum + a.shares * a.currentPrice,
    0
  );
  const remainingBalance = Math.max(0, longTermCapital - lockedTotalAllocated);

  if (remainingBalance <= 0 && lockedTotalAllocated >= longTermCapital) {
    return {
      updatedAssets: assets,
      success: false,
      message: `O valor fixado nos ativos travados já atinge ou supera o montante de longo prazo.`,
    };
  }

  const perAssetAmount = remainingBalance / unlockedAssets.length;

  const updatedAssets = assets.map((asset) => {
    if (!asset.isSelected) {
      return asset;
    }
    if (asset.isLocked) {
      return asset;
    }
    if (asset.currentPrice > 0) {
      const newShares = Math.floor(perAssetAmount / asset.currentPrice);
      return {
        ...asset,
        shares: newShares,
      };
    }
    return asset;
  });

  const numUnlocked = unlockedAssets.length;
  const numLocked = lockedAssets.length;
  const msg =
    numLocked > 0
      ? `Distribuição concluída! Saldo distribuído igualmente entre ${numUnlocked} ativos destravados (${numLocked} ativos mantiveram seus valores travados).`
      : `Distribuição concluída! Montante distribuído igualmente entre os ${numUnlocked} ativos habilitados.`;

  return {
    updatedAssets,
    success: true,
    message: msg,
  };
}

/**
 * Rebalanceia cotas com base nos percentuais das categorias
 */
export function executeCategoryRebalancing(
  assets: FiiAsset[],
  targets: CategoryTarget[],
  longTermCapital: number
): FiiAsset[] {
  if (longTermCapital <= 0) return assets;

  const targetMap = new Map(targets.map((t) => [t.categoryName, t.targetPercentage]));
  const activeAssets = assets.filter((a) => a.isSelected);

  const byCategory: Record<string, FiiAsset[]> = {};
  activeAssets.forEach((asset) => {
    if (!byCategory[asset.category]) {
      byCategory[asset.category] = [];
    }
    byCategory[asset.category].push(asset);
  });

  const sharesMap = new Map<string, number>();

  Object.entries(byCategory).forEach(([category, catAssets]) => {
    const targetPercent = targetMap.get(category) ?? 100 / Object.keys(byCategory).length;
    if (targetPercent <= 0 || catAssets.length === 0) {
      catAssets.forEach((a) => sharesMap.set(a.ticker, 0));
      return;
    }

    const categoryCapital = longTermCapital * (targetPercent / 100.0);
    const capitalPerAsset = categoryCapital / catAssets.length;

    catAssets.forEach((asset) => {
      if (asset.currentPrice > 0) {
        sharesMap.set(asset.ticker, Math.floor(capitalPerAsset / asset.currentPrice));
      }
    });
  });

  return assets.map((asset) => {
    if (!asset.isSelected) {
      return { ...asset, shares: 0 };
    }
    if (sharesMap.has(asset.ticker)) {
      return { ...asset, shares: sharesMap.get(asset.ticker)! };
    }
    return asset;
  });
}
