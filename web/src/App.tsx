import React, { useState, useEffect } from 'react';
import type { FiiAsset, PortfolioConfig, CategoryTarget, InvestorProfile } from './types';
import {
  DEFAULT_ASSETS,
  DEFAULT_PORTFOLIO_CONFIG,
  DEFAULT_CATEGORY_TARGETS,
} from './data/defaultData';
import {
  PROFILE_RULES,
  executeValueDistribution,
  executeCategoryRebalancing,
} from './services/balancingEngine';
import { fetchMarketQuote } from './services/marketService';
import { Navbar } from './components/Navbar';
import { ClientConfigCard } from './components/ClientConfigCard';
import { ProfileSelector } from './components/ProfileSelector';
import { PortfolioScreen } from './components/PortfolioScreen';
import { CategoryBalanceScreen } from './components/CategoryBalanceScreen';
import { ReportScreen } from './components/ReportScreen';
import { AddEditAssetModal } from './components/AddEditAssetModal';
import { EditClientConfigModal } from './components/EditClientConfigModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  ASSETS: 'montagem_carteira_assets_v1',
  CONFIG: 'montagem_carteira_config_v1',
  TARGETS: 'montagem_carteira_targets_v1',
};

export const App: React.FC = () => {
  // Persistence state
  const [assets, setAssets] = useState<FiiAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
      return saved ? JSON.parse(saved) : DEFAULT_ASSETS;
    } catch {
      return DEFAULT_ASSETS;
    }
  });

  const [config, setConfig] = useState<PortfolioConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_PORTFOLIO_CONFIG;
    } catch {
      return DEFAULT_PORTFOLIO_CONFIG;
    }
  });

  const [categoryTargets, setCategoryTargets] = useState<CategoryTarget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_TARGETS;
    } catch {
      return DEFAULT_CATEGORY_TARGETS;
    }
  });

  // UI state
  const [currentTab, setCurrentTab] = useState(0); // 0 = Carteira, 1 = Balanceamento %, 2 = Relatório
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Modals state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FiiAsset | null | undefined>(undefined); // undefined = closed, null = new, FiiAsset = edit

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(categoryTargets));
  }, [categoryTargets]);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };

  // Calculations
  const activeAssets = assets.filter((a) => a.isSelected);
  const totalInvested = activeAssets.reduce((sum, a) => sum + a.shares * a.currentPrice, 0);
  const monthlyIncome = activeAssets.reduce((sum, a) => sum + a.shares * a.lastDividend, 0);
  const avgYield = totalInvested > 0 ? (monthlyIncome / totalInvested) * 100 : 0;
  const longTermCapital = Math.max(0, config.totalToInvest - config.reserveFund);
  const capitalDifference = longTermCapital - totalInvested;

  // Profile Change Handler
  const handleSelectProfile = (profile: InvestorProfile) => {
    const rule = PROFILE_RULES[profile];
    const updatedConfig = { ...config, investorProfile: profile };
    setConfig(updatedConfig);

    // 1. Update selection of prioritized tickers
    const updatedAssets = assets.map((a) => ({
      ...a,
      isSelected: rule.prioritizedTickers.includes(a.ticker.toUpperCase()),
    }));

    // 2. Update category targets
    const newTargets: CategoryTarget[] = Object.entries(rule.categoryWeights).map(
      ([categoryName, targetPercentage]) => ({
        categoryName,
        targetPercentage,
      })
    );
    setCategoryTargets(newTargets);

    // 3. Rebalance cotas for this profile
    const balancedAssets = executeCategoryRebalancing(
      updatedAssets,
      newTargets,
      updatedConfig.totalToInvest - updatedConfig.reserveFund
    );
    setAssets(balancedAssets);

    showToast(`Estratégia ${rule.title} aplicada e balanceada com sucesso!`, 'success');
  };

  // Distribute Value Handler ("Distribuir Valor")
  const handleDistributeValue = async () => {
    setIsDistributing(true);
    showToast('Atualizando cotações antes de distribuir...', 'info');

    // Step 1: Online quote update for active assets
    const activeTickers = assets.filter((a) => a.isSelected).map((a) => a.ticker);
    const updatedQuotes: Record<string, number> = {};

    for (const t of activeTickers) {
      try {
        const quote = await fetchMarketQuote(t);
        if (quote.success && quote.price && quote.price > 0) {
          updatedQuotes[t] = quote.price;
        }
      } catch {
        // Continue to next quote
      }
    }

    const assetsWithQuotes = assets.map((a) => {
      if (updatedQuotes[a.ticker]) {
        return {
          ...a,
          currentPrice: updatedQuotes[a.ticker],
          isPriceUpdated: true,
          lastUpdated: Date.now(),
        };
      }
      return a;
    });

    // Step 2: Distribution logic with locked assets protection
    const result = executeValueDistribution(assetsWithQuotes, longTermCapital);

    setAssets(result.updatedAssets);
    setIsDistributing(false);

    if (result.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'warn');
    }
  };

  // Live Quotes Refresh
  const handleRefreshQuotes = async () => {
    setIsRefreshing(true);
    showToast('Buscando cotações atualizadas na B3...', 'info');

    let updatedCount = 0;
    const newAssets = [...assets];

    for (let i = 0; i < newAssets.length; i++) {
      const asset = newAssets[i];
      if (!asset.isSelected) continue;

      try {
        const quote = await fetchMarketQuote(asset.ticker);
        if (quote.success && quote.price && quote.price > 0) {
          newAssets[i] = {
            ...asset,
            currentPrice: quote.price,
            lastDividend: quote.lastDividend ?? asset.lastDividend,
            isPriceUpdated: true,
            lastUpdated: Date.now(),
          };
          updatedCount++;
        }
      } catch {
        // Fallback
      }
    }

    setAssets(newAssets);
    setIsRefreshing(false);
    showToast(
      updatedCount > 0
        ? `Cotações de ${updatedCount} ativo(s) atualizadas com sucesso!`
        : 'Cotações verificadas.',
      'success'
    );
  };

  // Rebalance by categories
  const handleRebalance = () => {
    const rebalanced = executeCategoryRebalancing(assets, categoryTargets, longTermCapital);
    setAssets(rebalanced);
    showToast('Carteira rebalanceada de acordo com as metas por categoria!', 'success');
  };

  // Toggle Single Asset Selection
  const handleToggleAsset = (ticker: string, isSelected: boolean) => {
    setAssets((prev) =>
      prev.map((a) => (a.ticker === ticker ? { ...a, isSelected } : a))
    );
  };

  // Toggle Lock Asset
  const handleToggleAssetLock = (ticker: string, isLocked: boolean) => {
    setAssets((prev) =>
      prev.map((a) => (a.ticker === ticker ? { ...a, isLocked } : a))
    );
    showToast(
      isLocked
        ? `Valor de ${ticker} travado: não será alterado na distribuição automática.`
        : `Valor de ${ticker} destravado.`,
      'info'
    );
  };

  // Stepper / Direct Shares update
  const handleUpdateShares = (ticker: string, shares: number) => {
    setAssets((prev) =>
      prev.map((a) => (a.ticker === ticker ? { ...a, shares } : a))
    );
  };

  // Delete Asset
  const handleRemoveAsset = (ticker: string) => {
    setAssets((prev) => prev.filter((a) => a.ticker !== ticker));
    showToast(`${ticker} removido da carteira.`, 'info');
  };

  // Save Asset (Add or Edit)
  const handleSaveAsset = (asset: FiiAsset) => {
    setAssets((prev) => {
      const idx = prev.findIndex((a) => a.ticker === asset.ticker);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = asset;
        return next;
      }
      return [...prev, asset];
    });
    setEditingAsset(undefined);
    showToast(`${asset.ticker} salvo com sucesso!`, 'success');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setAssets(DEFAULT_ASSETS);
    setConfig(DEFAULT_PORTFOLIO_CONFIG);
    setCategoryTargets(DEFAULT_CATEGORY_TARGETS);
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.TARGETS);
    showToast('Carteira restaurada para os padrões originais!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f1fc] via-[#edf4fd] to-[#f4f8fe] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalInvested={totalInvested}
        monthlyIncome={monthlyIncome}
        avgYield={avgYield}
        capitalDifference={capitalDifference}
        onResetDefaults={handleResetDefaults}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl neo-card text-xs sm:text-sm animate-slideUp">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
          <span className="text-slate-800 font-semibold">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Section: Client Card & Profile Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <div className="lg:col-span-2">
            <ClientConfigCard config={config} onEditClick={() => setShowConfigModal(true)} />
          </div>
          <div>
            <ProfileSelector
              currentProfile={config.investorProfile}
              onSelectProfile={handleSelectProfile}
            />
          </div>
        </div>

        {/* Tab 0: Portfolio Assets */}
        {currentTab === 0 && (
          <PortfolioScreen
            assets={assets}
            isRefreshing={isRefreshing}
            isDistributing={isDistributing}
            onDistributeValue={handleDistributeValue}
            onRefreshQuotes={handleRefreshQuotes}
            onToggleAsset={handleToggleAsset}
            onToggleAssetLock={handleToggleAssetLock}
            onUpdateShares={handleUpdateShares}
            onRemoveAsset={handleRemoveAsset}
            onEditAsset={(asset) => setEditingAsset(asset)}
            onAddAssetClick={() => setEditingAsset(null)}
            onToggleAllAssets={(activate) => {
              setAssets((prev) => prev.map((a) => ({ ...a, isSelected: activate })));
              showToast(
                activate ? 'Todos os ativos foram selecionados.' : 'Todos os ativos foram desmarcados.',
                'info'
              );
            }}
            onRebalance={handleRebalance}
          />
        )}

        {/* Tab 1: Category Balance */}
        {currentTab === 1 && (
          <CategoryBalanceScreen
            assets={assets}
            config={config}
            categoryTargets={categoryTargets}
            onUpdateTargets={setCategoryTargets}
            onRebalance={handleRebalance}
          />
        )}

        {/* Tab 2: Executive Report */}
        {currentTab === 2 && (
          <ReportScreen
            assets={assets}
            config={config}
            categoryTargets={categoryTargets}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-blue-100 bg-[#eaf2fc]/70 py-6 text-center text-xs text-slate-500 font-medium">
        <p>
          Montagem de Carteiras Online &bull; Desenvolvido para Investidores de FIIs, Fiagros e Renda Fixa.
        </p>
      </footer>

      {/* Modals */}
      {editingAsset !== undefined && (
        <AddEditAssetModal
          initialAsset={editingAsset}
          onDismiss={() => setEditingAsset(undefined)}
          onSave={handleSaveAsset}
        />
      )}

      {showConfigModal && (
        <EditClientConfigModal
          initialConfig={config}
          onDismiss={() => setShowConfigModal(false)}
          onSave={(newConfig) => {
            setConfig(newConfig);
            setShowConfigModal(false);
            showToast('Parâmetros do cliente atualizados com sucesso!', 'success');
          }}
        />
      )}
    </div>
  );
};

export default App;
