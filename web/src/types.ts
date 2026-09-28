export type InvestorProfile = 'CONSERVADOR' | 'MODERADO' | 'AGRESSIVO';
export type EmploymentType = 'CLT' | 'AUTONOMO' | 'SERVIDOR';

export interface FiiAsset {
  ticker: string;
  name: string;
  category: string;
  segmentType: string;
  currentPrice: number;
  lastDividend: number;
  shares: number;
  targetPercentage: number;
  isSelected: boolean;
  isLocked: boolean; // Travar Valor: impede alteração de alocação no "Distribuir Valor"
  isPriceUpdated: boolean;
  summaryText: string;
  gestora: string;
  recommendedProfiles: string;
  lastUpdated: number;
}

export interface PortfolioConfig {
  id: number;
  clientName: string;
  dateStr: string;
  totalToInvest: number;
  reserveFund: number;
  monthlyExpenses: number;
  employmentType: EmploymentType;
  investorProfile: InvestorProfile;
}

export interface CategoryTarget {
  categoryName: string;
  targetPercentage: number;
}

export interface CategorySummary {
  categoryName: string;
  targetPercent: number;
  currentAllocatedValue: number;
  currentAllocatedPercent: number;
  targetValue: number;
  differenceValue: number;
  assetCount: number;
}

export interface EducationalTerm {
  term: string;
  definition: string;
}

export interface ScrapedMarketData {
  ticker: string;
  price: number | null;
  lastDividend: number | null;
  dy12m: number | null;
  name: string | null;
  source: string;
  success: boolean;
  errorMessage?: string;
}
