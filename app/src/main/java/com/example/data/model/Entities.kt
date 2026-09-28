package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "fii_assets")
data class FiiAssetEntity(
    @PrimaryKey val ticker: String,
    val name: String,
    val category: String,          // CRA, CRI, Logística, Terras, Shopping, ETF Mundial, Energia Alternativas, ETF Renda Fixa
    val segmentType: String,       // Papel, Tijolo, Fiagro, ETF, Renda Fixa
    val currentPrice: Double,
    val lastDividend: Double,
    val shares: Int,
    val targetPercentage: Double,
    val isSelected: Boolean = true,
    val isLocked: Boolean = false,              // Travar Valor: impede alteração de alocação no "Distribuir Valor"
    val isPriceUpdated: Boolean = false,        // Cotação consultada com sucesso (habilita o controle "Travar Valor")
    val summaryText: String = "",
    val gestora: String = "",
    val recommendedProfiles: String = "MODERADO", // comma separated: CONSERVADOR,MODERADO,AGRESSIVO
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val totalValue: Double get() = shares * currentPrice
    val monthlyIncome: Double get() = shares * lastDividend
    val annualIncome: Double get() = monthlyIncome * 12.0
    val monthlyYieldPercent: Double get() = if (currentPrice > 0) (lastDividend / currentPrice) * 100.0 else 0.0
    val annualYieldPercent: Double get() = monthlyYieldPercent * 12.0
}

@Entity(tableName = "portfolio_config")
data class PortfolioConfigEntity(
    @PrimaryKey val id: Int = 1,
    val clientName: String = "FULANO",
    val dateStr: String = "11/09/2026",
    val totalToInvest: Double = 150000.0,
    val reserveFund: Double = 30000.0,
    val monthlyExpenses: Double = 6000.0,
    val employmentType: String = "CLT", // CLT, AUTONOMO, SERVIDOR
    val investorProfile: String = "MODERADO" // CONSERVADOR, MODERADO, AGRESSIVO
) {
    val longTermValue: Double get() = (totalToInvest - reserveFund).coerceAtLeast(0.0)
    val idealReserveMonths: Int get() = if (employmentType == "SERVIDOR") 3 else 6
    val idealReserveValue: Double get() = monthlyExpenses * idealReserveMonths
}

@Entity(tableName = "category_targets")
data class CategoryTargetEntity(
    @PrimaryKey val categoryName: String,
    val targetPercentage: Double
)
