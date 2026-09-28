package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.DefaultData
import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import com.example.data.network.ScrapedMarketData
import com.example.data.repository.PortfolioRepository
import com.example.ui.components.formatCurrency
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlin.math.abs

/**
 * Regras e pesos de balanceamento conforme o perfil do investidor
 * aplicados aos Fundos Imobiliários (FIIs) e Fiagros da carteira.
 */
data class ProfileBalanceRule(
    val profileCode: String,
    val title: String,
    val description: String,
    val categoryWeights: Map<String, Double>,
    val prioritizedTickers: Set<String>
)

object PortfolioBalancingEngine {
    val CONSERVADOR = ProfileBalanceRule(
        profileCode = "CONSERVADOR",
        title = "Conservador",
        description = "Foco em proteção do patrimônio e previsibilidade de caixa: prioriza FIIs de Papel/CRI High Grade (pós-fixados CDI e IPCA), ETF Renda Fixa e galpões logísticos defensivos.",
        categoryWeights = mapOf(
            "CRI / Papel" to 45.0,
            "ETF Renda Fixa" to 30.0,
            "Logística / Tijolo" to 25.0,
            "CRA / Fiagro" to 0.0,
            "Terras / Agrícola" to 0.0,
            "Shopping / Tijolo" to 0.0,
            "ETF Mundial" to 0.0,
            "Energia Alternativas" to 0.0
        ),
        prioritizedTickers = setOf("KNCR11", "KNSC11", "GARE11", "LLFT11")
    )

    val MODERADO = ProfileBalanceRule(
        profileCode = "MODERADO",
        title = "Moderado",
        description = "Carteira equilibrada entre dividendos recorrentes de Fiagros e CRIs, aliada a valorização de tijolo (logística e shopping) e proteção macroeconômica global.",
        categoryWeights = mapOf(
            "CRI / Papel" to 22.0,
            "CRA / Fiagro" to 18.0,
            "Logística / Tijolo" to 11.0,
            "Terras / Agrícola" to 11.0,
            "Shopping / Tijolo" to 11.0,
            "Energia Alternativas" to 11.0,
            "ETF Mundial" to 9.0,
            "ETF Renda Fixa" to 7.0
        ),
        prioritizedTickers = setOf("RZAG11", "KNSC11", "KNCR11", "GARE11", "RZTR11", "HSML11", "WRLD11", "SNEL11", "LLFT11")
    )

    val AGRESSIVO = ProfileBalanceRule(
        profileCode = "AGRESSIVO",
        title = "Agressivo",
        description = "Maximização de yield mensal e ganho de capital: alta exposição a Fiagros de CRA e terras agrícolas de alta produtividade, energia renovável e ações mundiais.",
        categoryWeights = mapOf(
            "CRA / Fiagro" to 28.0,
            "Terras / Agrícola" to 18.0,
            "Energia Alternativas" to 18.0,
            "ETF Mundial" to 16.0,
            "Shopping / Tijolo" to 10.0,
            "Logística / Tijolo" to 10.0,
            "CRI / Papel" to 0.0,
            "ETF Renda Fixa" to 0.0
        ),
        prioritizedTickers = setOf("RZAG11", "RZTR11", "SNEL11", "WRLD11", "HSML11", "GARE11")
    )

    fun getRule(profile: String): ProfileBalanceRule {
        return when (profile.uppercase()) {
            "CONSERVADOR" -> CONSERVADOR
            "AGRESSIVO", "ARROJADO" -> AGRESSIVO
            else -> MODERADO
        }
    }
}

data class CategorySummary(
    val categoryName: String,
    val targetPercent: Double,
    val currentAllocatedValue: Double,
    val currentAllocatedPercent: Double,
    val targetValue: Double,
    val differenceValue: Double,
    val assetCount: Int
)

/**
 * Estado unificado e reativo da aplicação e da carteira
 */
data class PortfolioUiState(
    val totalInvested: Double = 0.0,
    val totalMonthlyIncome: Double = 0.0,
    val totalAnnualIncome: Double = 0.0,
    val averageMonthlyYield: Double = 0.0,
    val activeAssetsCount: Int = 0,
    val totalAssetsCount: Int = 0,
    val capitalToInvest: Double = 0.0,
    val longTermCapital: Double = 0.0,
    val capitalDifference: Double = 0.0,
    val totalTargetPercentage: Double = 100.0,
    val investorProfile: String = "MODERADO",
    val profileTitle: String = "Moderado",
    val profileDescription: String = "",
    val categorySummaries: List<CategorySummary> = emptyList(),
    val isBalanced: Boolean = true
)

class PortfolioViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getInstance(application)
    private val repository = PortfolioRepository(database.fiiDao())

    val allAssets: StateFlow<List<FiiAssetEntity>> = repository.allAssets
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val portfolioConfig: StateFlow<PortfolioConfigEntity> = repository.portfolioConfig
        .map { it ?: DefaultData.defaultPortfolioConfig }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DefaultData.defaultPortfolioConfig)

    val categoryTargets: StateFlow<List<CategoryTargetEntity>> = repository.categoryTargets
        .map { if (it.isEmpty()) DefaultData.defaultCategoryTargets else it }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DefaultData.defaultCategoryTargets)

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    private val _isDistributing = MutableStateFlow(false)
    val isDistributing: StateFlow<Boolean> = _isDistributing.asStateFlow()

    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    private val _selectedTab = MutableStateFlow(0) // 0 = Carteira, 1 = Balanceamento %, 2 = Relatório
    val selectedTab: StateFlow<Int> = _selectedTab.asStateFlow()

    // Estado reativo consolidado para a UI
    val uiState: StateFlow<PortfolioUiState> = combine(
        allAssets,
        portfolioConfig,
        categoryTargets
    ) { assets, config, targets ->
        buildPortfolioUiState(assets, config, targets)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), PortfolioUiState())

    init {
        viewModelScope.launch {
            val dao = database.fiiDao()
            val existing = dao.getPortfolioConfigSync()
            if (existing == null || existing.clientName.equals("Fernanda", ignoreCase = true) || existing.clientName.isBlank()) {
                dao.savePortfolioConfig(DefaultData.defaultPortfolioConfig)
            }
            dao.saveCategoryTargets(DefaultData.defaultCategoryTargets)
        }
    }

    private fun buildPortfolioUiState(
        assets: List<FiiAssetEntity>,
        config: PortfolioConfigEntity,
        targets: List<CategoryTargetEntity>
    ): PortfolioUiState {
        val activeAssets = assets.filter { it.isSelected }
        val totalInvested = activeAssets.sumOf { it.totalValue }
        val monthlyIncome = activeAssets.sumOf { it.monthlyIncome }
        val annualIncome = monthlyIncome * 12.0
        val avgYield = if (totalInvested > 0) (monthlyIncome / totalInvested) * 100.0 else 0.0

        val targetMap = targets.associate { it.categoryName to it.targetPercentage }
        val longTermCap = config.longTermValue

        val summaries = targets.map { target ->
            val catAssets = activeAssets.filter { it.category == target.categoryName }
            val catValue = catAssets.sumOf { it.totalValue }
            val currentAllocPct = if (totalInvested > 0) (catValue / totalInvested) * 100.0 else 0.0
            val idealCatVal = (target.targetPercentage / 100.0) * longTermCap

            CategorySummary(
                categoryName = target.categoryName,
                targetPercent = target.targetPercentage,
                currentAllocatedValue = catValue,
                currentAllocatedPercent = currentAllocPct,
                targetValue = idealCatVal,
                differenceValue = idealCatVal - catValue,
                assetCount = catAssets.size
            )
        }

        val totalTargetPct = targets.sumOf { it.targetPercentage }
        val rule = PortfolioBalancingEngine.getRule(config.investorProfile)

        return PortfolioUiState(
            totalInvested = totalInvested,
            totalMonthlyIncome = monthlyIncome,
            totalAnnualIncome = annualIncome,
            averageMonthlyYield = avgYield,
            activeAssetsCount = activeAssets.size,
            totalAssetsCount = assets.size,
            capitalToInvest = config.totalToInvest,
            longTermCapital = longTermCap,
            capitalDifference = longTermCap - totalInvested,
            totalTargetPercentage = totalTargetPct,
            investorProfile = config.investorProfile,
            profileTitle = rule.title,
            profileDescription = rule.description,
            categorySummaries = summaries,
            isBalanced = abs(longTermCap - totalInvested) < 150.0 && abs(totalTargetPct - 100.0) < 0.1
        )
    }

    fun selectTab(tabIndex: Int) {
        _selectedTab.value = tabIndex
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }

    fun setInvestorProfile(profile: String) {
        viewModelScope.launch {
            val rule = PortfolioBalancingEngine.getRule(profile)
            val currentConfig = portfolioConfig.value
            val updatedConfig = currentConfig.copy(investorProfile = rule.profileCode)
            repository.savePortfolioConfig(updatedConfig)

            val currentAssets = allAssets.value

            // 1. Atualiza seleção de ativos para o perfil
            for (asset in currentAssets) {
                val shouldSelect = rule.prioritizedTickers.contains(asset.ticker.uppercase())
                repository.toggleAssetSelection(asset.ticker, shouldSelect)
            }

            // 2. Atualiza os percentuais alvo por categoria
            val newTargets = rule.categoryWeights.map { (catName, targetPct) ->
                CategoryTargetEntity(catName, targetPct)
            }
            repository.saveCategoryTargets(newTargets)

            // 3. Processa a lógica de balanceamento de cotas
            val activeAssetsForBalancing = currentAssets.map {
                it.copy(isSelected = rule.prioritizedTickers.contains(it.ticker.uppercase()))
            }
            processBalancingCalculation(
                capitalToAllocate = updatedConfig.longTermValue,
                assets = activeAssetsForBalancing,
                targets = newTargets
            )

            _userMessage.value = "Perfil ${rule.title} aplicado! FIIs e Fiagros balanceados conforme a tese."
        }
    }

    fun rebalance() {
        viewModelScope.launch {
            val config = portfolioConfig.value
            val assets = allAssets.value
            val targets = categoryTargets.value

            processBalancingCalculation(
                capitalToAllocate = config.longTermValue,
                assets = assets,
                targets = targets
            )

            _userMessage.value = "Carteira de FIIs e Fiagros rebalanceada com sucesso!"
        }
    }

    private suspend fun processBalancingCalculation(
        capitalToAllocate: Double,
        assets: List<FiiAssetEntity>,
        targets: List<CategoryTargetEntity>
    ) {
        if (capitalToAllocate <= 0) return
        val activeAssets = assets.filter { it.isSelected }
        if (activeAssets.isEmpty()) return

        val targetMap = targets.associate { it.categoryName to it.targetPercentage }
        val byCategory = activeAssets.groupBy { it.category }

        for ((category, categoryAssets) in byCategory) {
            val targetPercent = targetMap[category] ?: (100.0 / byCategory.size)
            if (targetPercent <= 0 || categoryAssets.isEmpty()) {
                categoryAssets.forEach { repository.updateShares(it.ticker, 0) }
                continue
            }

            val categoryCapital = capitalToAllocate * (targetPercent / 100.0)
            val capitalPerAsset = categoryCapital / categoryAssets.size

            for (asset in categoryAssets) {
                if (asset.currentPrice > 0) {
                    val optimalShares = (capitalPerAsset / asset.currentPrice).toInt()
                    repository.updateShares(asset.ticker, optimalShares)
                }
            }
        }

        val inactiveAssets = assets.filter { !it.isSelected }
        for (inactive in inactiveAssets) {
            if (inactive.shares > 0) {
                repository.updateShares(inactive.ticker, 0)
            }
        }
    }

    fun toggleAsset(ticker: String, isSelected: Boolean) {
        viewModelScope.launch {
            repository.toggleAssetSelection(ticker, isSelected)
        }
    }

    fun toggleAssetLock(ticker: String, isLocked: Boolean) {
        viewModelScope.launch {
            repository.toggleAssetLock(ticker, isLocked)
            val asset = allAssets.value.find { it.ticker == ticker }
            val status = if (isLocked) "travado" else "destravado"
            _userMessage.value = "Valor de $ticker $status para futuras distribuições."
        }
    }

    fun activateAllAssets() {
        toggleAllAssets(true)
    }

    fun toggleAllAssets(activate: Boolean) {
        viewModelScope.launch {
            repository.setAllAssetsSelection(activate)
            _userMessage.value = if (activate) {
                "Todos os ativos da carteira foram ativados!"
            } else {
                "Todos os ativos da carteira foram desativados!"
            }
        }
    }

    /**
     * Execução da Distribuição de Valor na Ordem Estrita especificada:
     * 1. Validação de ativos ativos.
     * 2. Passo 1: Consulta de preços atualizados para os ativos ativos e habilitação de 'Travar Valor'.
     * 3. Passo 2: Cálculo da distribuição, deduzindo valores dos ativos travados e distribuindo
     *    o saldo restante igualmente apenas entre os ativos destravados.
     * 4. Passo 3: Atualização do estado e UI.
     */
    fun distributeValue() {
        viewModelScope.launch {
            val currentAssets = allAssets.value
            val activeAssets = currentAssets.filter { it.isSelected }

            // Validação: Verificar se há pelo menos um ativo com status "ativo/habilitado"
            if (activeAssets.isEmpty()) {
                _userMessage.value = "É necessário ter pelo menos um ativo habilitado!"
                return@launch
            }

            _isDistributing.value = true
            try {
                // Passo 1 (Atualização Prévia de Cotações):
                // Consultar preços atualizados das cotas ativas (B3, Investidor10, Status Invest)
                var updatedQuotesCount = 0
                for (asset in activeAssets) {
                    try {
                        val quote = repository.fetchQuoteOnline(asset.ticker)
                        if (quote.success && quote.price != null && quote.price > 0) {
                            val updated = asset.copy(
                                currentPrice = quote.price,
                                lastDividend = quote.lastDividend ?: asset.lastDividend,
                                isPriceUpdated = true,
                                lastUpdated = System.currentTimeMillis()
                            )
                            repository.updateAsset(updated)
                            updatedQuotesCount++
                        }
                    } catch (_: Exception) {
                        // Trata erros de cotação por ativo sem abortar o fluxo
                    }
                }

                // Passo 2 (Cálculo da Distribuição):
                val refreshedAssets = repository.getAllAssetsSync()
                val refreshedActiveAssets = refreshedAssets.filter { it.isSelected }

                val unlockedAssets = refreshedActiveAssets.filter { !it.isLocked }
                val lockedAssets = refreshedActiveAssets.filter { it.isLocked }

                // Se todos os ativos habilitados estiverem travados: exibir aviso e não alterar alocações
                if (unlockedAssets.isEmpty()) {
                    _userMessage.value = "Todos os ativos habilitados estão com o valor travado. Nenhuma alocação foi alterada."
                    return@launch
                }

                val config = portfolioConfig.value
                val totalCapital = config.longTermValue // Total de longo prazo para investimento

                // Deduzir do montante total a ser investido os valores fixados/já alocados nos ativos travados
                val lockedTotalAllocated = lockedAssets.sumOf { it.shares * it.currentPrice }
                val remainingBalance = (totalCapital - lockedTotalAllocated).coerceAtLeast(0.0)

                if (remainingBalance <= 0.0 && lockedTotalAllocated >= totalCapital) {
                    _userMessage.value = "O valor fixado nos ativos travados (${formatCurrency(lockedTotalAllocated)}) já atinge ou supera o montante total (${formatCurrency(totalCapital)})."
                    return@launch
                }

                // Distribuir o saldo restante igualmente apenas entre os ativos destravados:
                // Valor por ativo destravado = Saldo a Distribuir / Qtd de ativos destravados
                val perAssetAmount = remainingBalance / unlockedAssets.size

                // Recalcular a quantidade de cotas de cada ativo destravado com base na cotação recém-atualizada
                for (unlocked in unlockedAssets) {
                    if (unlocked.currentPrice > 0) {
                        val newShares = (perAssetAmount / unlocked.currentPrice).toInt()
                        repository.updateShares(unlocked.ticker, newShares)
                    }
                }

                // Passo 3 (UI e Estado): Feedback completo
                val numUnlocked = unlockedAssets.size
                val numLocked = lockedAssets.size
                _userMessage.value = if (numLocked > 0) {
                    "Distribuição concluída com cotações atualizadas! ${formatCurrency(remainingBalance)} distribuídos igualmente entre $numUnlocked ativos destravados ($numLocked ativos mantiveram seus valores travados)."
                } else {
                    "Distribuição concluída com cotações atualizadas! ${formatCurrency(remainingBalance)} distribuídos igualmente entre os $numUnlocked ativos."
                }

            } catch (e: Exception) {
                _userMessage.value = "Erro na distribuição: ${e.message ?: "Falha ao processar dados."}"
            } finally {
                _isDistributing.value = false
            }
        }
    }

    fun updateShares(ticker: String, count: Int) {
        viewModelScope.launch {
            repository.updateShares(ticker, count)
        }
    }

    fun removeAsset(ticker: String) {
        viewModelScope.launch {
            repository.deleteAsset(ticker)
            _userMessage.value = "$ticker removido da carteira"
        }
    }

    fun saveAsset(asset: FiiAssetEntity) {
        viewModelScope.launch {
            repository.insertAsset(asset)
            _userMessage.value = "${asset.ticker} salvo com sucesso!"
        }
    }

    fun updateConfig(newConfig: PortfolioConfigEntity) {
        viewModelScope.launch {
            repository.savePortfolioConfig(newConfig)
        }
    }

    fun updateCategoryTargets(newTargets: List<CategoryTargetEntity>) {
        viewModelScope.launch {
            repository.saveCategoryTargets(newTargets)
        }
    }

    fun refreshQuotesOnline() {
        viewModelScope.launch {
            _isRefreshing.value = true
            try {
                val count = repository.refreshQuotesForActiveAssets()
                _userMessage.value = if (count > 0) "Cotações de $count ativos atualizadas com sucesso!" else "Cotações já estão atualizadas."
            } catch (e: Exception) {
                _userMessage.value = "Não foi possível conectar: verifique a conexão."
            } finally {
                _isRefreshing.value = false
            }
        }
    }

    suspend fun searchOnlineQuote(ticker: String): ScrapedMarketData {
        return repository.fetchQuoteOnline(ticker)
    }

    fun resetDefaults() {
        viewModelScope.launch {
            repository.resetToOriginalSheet()
            _userMessage.value = "Carteira restaurada para o modelo da planilha original."
        }
    }
}
