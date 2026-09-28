package com.example.data.repository

import com.example.data.local.DefaultData
import com.example.data.local.FiiDao
import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import com.example.data.network.InvestidorScraper
import com.example.data.network.ScrapedMarketData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class PortfolioRepository(
    private val fiiDao: FiiDao,
    private val scraper: InvestidorScraper = InvestidorScraper()
) {
    val allAssets: Flow<List<FiiAssetEntity>> = fiiDao.getAllAssets()
    val portfolioConfig: Flow<PortfolioConfigEntity?> = fiiDao.getPortfolioConfig()
    val categoryTargets: Flow<List<CategoryTargetEntity>> = fiiDao.getAllCategoryTargets()

    suspend fun getAllAssetsSync(): List<FiiAssetEntity> {
        return fiiDao.getAllAssetsSync()
    }

    suspend fun insertAsset(asset: FiiAssetEntity) {
        fiiDao.insertAsset(asset)
    }

    suspend fun updateAsset(asset: FiiAssetEntity) {
        fiiDao.updateAsset(asset)
    }

    suspend fun deleteAsset(ticker: String) {
        fiiDao.deleteAsset(ticker)
    }

    suspend fun toggleAssetSelection(ticker: String, isSelected: Boolean) {
        val asset = fiiDao.getAsset(ticker) ?: return
        fiiDao.updateAsset(asset.copy(isSelected = isSelected))
    }

    suspend fun toggleAssetLock(ticker: String, isLocked: Boolean) {
        fiiDao.updateAssetLock(ticker, isLocked)
    }

    suspend fun activateAllAssets() {
        fiiDao.activateAllAssets()
    }

    suspend fun setAllAssetsSelection(selected: Boolean) {
        fiiDao.setAllAssetsSelection(selected)
    }

    suspend fun updateShares(ticker: String, newShares: Int) {
        val asset = fiiDao.getAsset(ticker) ?: return
        fiiDao.updateAsset(asset.copy(shares = newShares.coerceAtLeast(0)))
    }

    suspend fun savePortfolioConfig(config: PortfolioConfigEntity) {
        fiiDao.savePortfolioConfig(config)
    }

    suspend fun saveCategoryTargets(targets: List<CategoryTargetEntity>) {
        fiiDao.saveCategoryTargets(targets)
    }

    suspend fun fetchQuoteOnline(ticker: String): ScrapedMarketData {
        return scraper.fetchMarketData(ticker)
    }

    suspend fun refreshQuotesForActiveAssets(): Int {
        val assets = allAssets.firstOrNull() ?: emptyList()
        var updatedCount = 0
        for (asset in assets) {
            if (asset.isSelected) {
                val data = scraper.fetchMarketData(asset.ticker)
                if (data.success && data.price != null && data.price > 0) {
                    val updated = asset.copy(
                        currentPrice = data.price,
                        lastDividend = data.lastDividend ?: asset.lastDividend,
                        name = if (asset.name.isBlank() || asset.name == asset.ticker) data.name ?: asset.name else asset.name,
                        isPriceUpdated = true,
                        lastUpdated = System.currentTimeMillis()
                    )
                    fiiDao.updateAsset(updated)
                    updatedCount++
                }
            }
        }
        return updatedCount
    }

    suspend fun applyInvestorProfile(profile: String) {
        val config = portfolioConfig.firstOrNull() ?: DefaultData.defaultPortfolioConfig
        fiiDao.savePortfolioConfig(config.copy(investorProfile = profile))

        val currentAssets = allAssets.firstOrNull() ?: emptyList()
        if (currentAssets.isEmpty()) return

        when (profile.uppercase()) {
            "CONSERVADOR" -> {
                val conservativeTickers = setOf("KNCR11", "KNSC11", "GARE11", "LLFT11")
                for (asset in currentAssets) {
                    val select = conservativeTickers.contains(asset.ticker.uppercase())
                    fiiDao.updateAsset(asset.copy(isSelected = select))
                }
                val newTargets = listOf(
                    CategoryTargetEntity("CRI / Papel", 45.0),
                    CategoryTargetEntity("ETF Renda Fixa", 30.0),
                    CategoryTargetEntity("Logística / Tijolo", 25.0),
                    CategoryTargetEntity("CRA / Fiagro", 0.0),
                    CategoryTargetEntity("Terras / Agrícola", 0.0),
                    CategoryTargetEntity("Shopping / Tijolo", 0.0),
                    CategoryTargetEntity("ETF Mundial", 0.0),
                    CategoryTargetEntity("Energia Alternativas", 0.0)
                )
                fiiDao.saveCategoryTargets(newTargets)
            }
            "AGRESSIVO" -> {
                val aggressiveTickers = setOf("RZAG11", "RURA11", "RZTR11", "SNEL11", "WRLD11", "HSML11", "GARE11")
                for (asset in currentAssets) {
                    val select = aggressiveTickers.contains(asset.ticker.uppercase())
                    fiiDao.updateAsset(asset.copy(isSelected = select))
                }
                val newTargets = listOf(
                    CategoryTargetEntity("CRA / Fiagro", 28.0),
                    CategoryTargetEntity("Terras / Agrícola", 18.0),
                    CategoryTargetEntity("Energia Alternativas", 18.0),
                    CategoryTargetEntity("ETF Mundial", 16.0),
                    CategoryTargetEntity("Shopping / Tijolo", 10.0),
                    CategoryTargetEntity("Logística / Tijolo", 10.0),
                    CategoryTargetEntity("CRI / Papel", 0.0),
                    CategoryTargetEntity("ETF Renda Fixa", 0.0)
                )
                fiiDao.saveCategoryTargets(newTargets)
            }
            else -> {
                for (asset in currentAssets) {
                    fiiDao.updateAsset(asset.copy(isSelected = true))
                }
                fiiDao.saveCategoryTargets(DefaultData.defaultCategoryTargets)
            }
        }

        rebalancePortfolio()
    }

    suspend fun rebalancePortfolio() {
        val config = portfolioConfig.firstOrNull() ?: DefaultData.defaultPortfolioConfig
        val capitalToAllocate = config.longTermValue
        if (capitalToAllocate <= 0) return

        val assets = (allAssets.firstOrNull() ?: emptyList()).filter { it.isSelected }
        if (assets.isEmpty()) return

        val targets = (categoryTargets.firstOrNull() ?: emptyList()).associateBy { it.categoryName }
        val byCategory = assets.groupBy { it.category }

        for ((category, categoryAssets) in byCategory) {
            val targetPercent = targets[category]?.targetPercentage ?: (100.0 / byCategory.size)
            if (targetPercent <= 0) {
                categoryAssets.forEach { fiiDao.updateAsset(it.copy(shares = 0)) }
                continue
            }

            val categoryCapital = capitalToAllocate * (targetPercent / 100.0)
            val perAssetCapital = categoryCapital / categoryAssets.size

            for (asset in categoryAssets) {
                if (asset.currentPrice > 0) {
                    val suggestedShares = (perAssetCapital / asset.currentPrice).toInt()
                    fiiDao.updateAsset(asset.copy(shares = suggestedShares))
                }
            }
        }
    }

    suspend fun resetToOriginalSheet() {
        fiiDao.clearAllAssets()
        fiiDao.savePortfolioConfig(DefaultData.defaultPortfolioConfig)
        fiiDao.saveCategoryTargets(DefaultData.defaultCategoryTargets)
        fiiDao.insertAssets(DefaultData.defaultAssets)
    }
}
