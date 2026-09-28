package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import com.example.ui.components.CategoryChip
import com.example.ui.components.SoftUiMetricBadge
import com.example.ui.components.SpatialGlassCard
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatPercent
import com.example.ui.components.spatialEtherealBackground
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftAmber
import com.example.ui.theme.SoftAmberBg
import com.example.ui.theme.SoftAmberBorder
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.SoftGreenBg
import com.example.ui.theme.SoftGreenBorder
import com.example.ui.theme.SpatialCobaltContainer
import com.example.ui.theme.SpatialCobaltPrimary
import com.example.ui.theme.SpatialCobaltSecondary
import com.example.ui.theme.SpatialGlassSurface
import com.example.ui.theme.SpatialGlassSurfaceSubtle
import com.example.ui.theme.SpatialGlassSurfaceVariant
import com.example.ui.theme.SpatialSapphireBorder
import com.example.ui.theme.SpatialSapphireBorderSoft
import com.example.ui.theme.SpatialSapphireBorderStrong
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun PortfolioScreen(
    assets: List<FiiAssetEntity>,
    config: PortfolioConfigEntity,
    isRefreshing: Boolean,
    isDistributing: Boolean = false,
    onProfileSelected: (String) -> Unit,
    onToggleAsset: (String, Boolean) -> Unit,
    onToggleAssetLock: (String, Boolean) -> Unit = { _, _ -> },
    onDistributeValue: () -> Unit = {},
    onUpdateShares: (String, Int) -> Unit,
    onRemoveAsset: (String) -> Unit,
    onEditAsset: (FiiAssetEntity) -> Unit,
    onAddAssetClick: () -> Unit,
    onEditConfigClick: () -> Unit,
    onRefreshQuotes: () -> Unit,
    onToggleAllAssets: (Boolean) -> Unit = {},
    onRebalance: () -> Unit
) {
    val activeAssets = assets.filter { it.isSelected }
    val totalInvested = activeAssets.sumOf { it.totalValue }
    val totalMonthlyIncome = activeAssets.sumOf { it.monthlyIncome }
    val totalAnnualIncome = totalMonthlyIncome * 12.0
    val avgMonthlyYield = if (totalInvested > 0) (totalMonthlyIncome / totalInvested) * 100.0 else 0.0

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .spatialEtherealBackground()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            // Client & Capital Overview Card (Spatial Glassmorphic)
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("client_overview_card"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorder
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    Brush.linearGradient(
                                        listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                    ),
                                    CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Proposta: ${config.clientName}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Data: ${config.dateStr}",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                    IconButton(
                        onClick = onEditConfigClick,
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("edit_client_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Editar Proposta",
                            tint = SpatialCobaltPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Metric Badges Grid
                Row(modifier = Modifier.fillMaxWidth()) {
                    SoftUiMetricBadge(
                        title = "Para Investir",
                        value = formatCurrency(config.totalToInvest),
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    SoftUiMetricBadge(
                        title = "Fundo Reserva",
                        value = formatCurrency(config.reserveFund),
                        modifier = Modifier.weight(1f)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    SoftUiMetricBadge(
                        title = "Longo Prazo",
                        value = formatCurrency(config.longTermValue),
                        isHighlight = true,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    SoftUiMetricBadge(
                        title = "Reserva Ideal",
                        value = formatCurrency(config.idealReserveValue),
                        subtitle = "${config.employmentType} (${config.idealReserveMonths} meses)",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Investor Profile Selector Section
        item {
            SpatialGlassCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorder
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Perfil de Investidor",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Box(
                        modifier = Modifier
                            .background(SpatialCobaltContainer, RoundedCornerShape(8.dp))
                            .border(1.dp, SpatialSapphireBorderSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = config.investorProfile,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SpatialCobaltPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("CONSERVADOR", "MODERADO", "AGRESSIVO").forEach { profile ->
                        val isSelected = config.investorProfile.equals(profile, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onProfileSelected(profile) }
                                .background(
                                    if (isSelected) {
                                        Brush.horizontalGradient(
                                            listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                        )
                                    } else {
                                        Brush.horizontalGradient(
                                            listOf(SpatialGlassSurfaceVariant, SpatialGlassSurfaceVariant)
                                        )
                                    }
                                )
                                .border(
                                    1.2.dp,
                                    if (isSelected) SpatialSapphireBorderStrong else SpatialSapphireBorderSoft,
                                    RoundedCornerShape(12.dp)
                                )
                                .padding(vertical = 10.dp)
                                .testTag("profile_button_$profile"),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = profile.lowercase().replaceFirstChar { it.uppercase() },
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else TextPrimary
                            )
                        }
                        if (profile != "AGRESSIVO") Spacer(modifier = Modifier.width(8.dp))
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                val profileDescription = when (config.investorProfile.uppercase()) {
                    "CONSERVADOR" -> "Foco em títulos de crédito imobiliário High Grade (CRI/Papel) e Tesouro Selic (LLFT11) com máxima segurança e renda previsível."
                    "AGRESSIVO" -> "Foco em retornos expressivos via Fiagros (RZAG11, RURA11), terras agrícolas (RZTR11), energia limpa (SNEL11) e ações globais (WRLD11)."
                    else -> "Carteira balanceada e diversificada em 10 ativos conforme a proposta original (Papel, Tijolo, Fiagro, Terras, Shopping e ETF)."
                }
                Text(
                    text = profileDescription,
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 15.sp
                )
            }
        }

        // Return Expectation Banner
        item {
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("portfolio_return_banner"),
                backgroundColor = SoftGreenBg,
                borderColor = SoftGreenBorder
            ) {
                // Linha 1: Título e Ícone
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = SoftGreen,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Expectativa de Retorno Mensal",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = SoftGreen
                    )
                }

                // Linha 2: Taxa de Retorno Mensal
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(alpha = 0.85f), RoundedCornerShape(10.dp))
                        .border(1.dp, SoftGreenBorder.copy(alpha = 0.7f), RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 7.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Taxa de retorno mensal estimada:",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary
                    )
                    Box(
                        modifier = Modifier
                            .background(SoftGreen, RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "${formatPercent(avgMonthlyYield)} ao mês",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Renda Mensal Estimada", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = formatCurrency(totalMonthlyIncome),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = SoftGreen
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Renda Anual Estimada", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = formatCurrency(totalAnnualIncome),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = SpatialCobaltPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Total alocado em cotas: ${formatCurrency(totalInvested)} (${activeAssets.size} de ${assets.size} ativos ativos)",
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }
        }

        // Action Toolbar
        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Linha de cima: Título e contagem
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ativos da Carteira (${assets.size})",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )

                    Text(
                        text = "${activeAssets.size} de ${assets.size} ativos ativos",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SpatialCobaltPrimary
                    )
                }

                // Destaque Principal: Botão "Distribuir Valor"
                Button(
                    onClick = onDistributeValue,
                    enabled = !isDistributing && !isRefreshing,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SpatialCobaltPrimary,
                        disabledContainerColor = SpatialCobaltPrimary.copy(alpha = 0.5f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .testTag("distribute_value_button")
                ) {
                    if (isDistributing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Atualizando cotações e distribuindo...",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Savings,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Distribuir Valor",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                // Linha secundária de ações: 3 botões (Cotações, Novo Ativo, Toggle Switch Mestre)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Botão 1: Cotações
                    OutlinedButton(
                        onClick = onRefreshQuotes,
                        enabled = !isRefreshing && !isDistributing,
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.2.dp, SpatialSapphireBorder),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = SpatialGlassSurfaceVariant
                        ),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(40.dp)
                            .testTag("refresh_quotes_button")
                    ) {
                        if (isRefreshing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(13.dp),
                                strokeWidth = 2.dp,
                                color = SpatialCobaltPrimary
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Atualizar Cotações",
                                modifier = Modifier.size(15.dp),
                                tint = SpatialCobaltPrimary
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Cotações", fontSize = 11.sp, color = SpatialCobaltPrimary, fontWeight = FontWeight.SemiBold, maxLines = 1)
                        }
                    }

                    // Botão 2: Novo Ativo
                    Button(
                        onClick = onAddAssetClick,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = SpatialCobaltPrimary),
                        contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(40.dp)
                            .testTag("add_asset_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Adicionar Ativo",
                            tint = Color.White,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text("Novo Ativo", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                    }

                    // Controle 3: Toggle Switch Mestre Ativar / Desativar Todos
                    val allActive = assets.isNotEmpty() && activeAssets.size == assets.size
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (allActive) SpatialCobaltContainer else SpatialGlassSurfaceVariant,
                        border = androidx.compose.foundation.BorderStroke(
                            1.2.dp,
                            if (allActive) SpatialSapphireBorderStrong else SpatialSapphireBorder
                        ),
                        modifier = Modifier
                            .weight(1.3f)
                            .height(40.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onToggleAllAssets(!allActive) }
                            .testTag("toggle_all_assets_container")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (allActive) "Todos ON" else "Todos OFF",
                                fontSize = 11.sp,
                                fontWeight = if (allActive) FontWeight.Bold else FontWeight.Medium,
                                color = if (allActive) SpatialCobaltPrimary else TextPrimary,
                                maxLines = 1
                            )
                            Switch(
                                checked = allActive,
                                onCheckedChange = { isChecked -> onToggleAllAssets(isChecked) },
                                modifier = Modifier
                                    .scale(0.72f)
                                    .testTag("toggle_all_assets_switch"),
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = SpatialCobaltPrimary,
                                    uncheckedThumbColor = TextMuted,
                                    uncheckedTrackColor = SpatialSapphireBorderSoft
                                )
                            )
                        }
                    }
                }
            }
        }

        // Assets List
        items(assets, key = { it.ticker }) { asset ->
            AssetCard(
                asset = asset,
                onToggle = { onToggleAsset(asset.ticker, it) },
                onToggleLock = { onToggleAssetLock(asset.ticker, it) },
                onEdit = { onEditAsset(asset) },
                onRemove = { onRemoveAsset(asset.ticker) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun AssetCard(
    asset: FiiAssetEntity,
    onToggle: (Boolean) -> Unit,
    onToggleLock: (Boolean) -> Unit,
    onEdit: () -> Unit,
    onRemove: () -> Unit
) {
    SpatialGlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("asset_card_${asset.ticker}"),
        backgroundColor = if (asset.isSelected) SpatialGlassSurface else SpatialGlassSurfaceVariant.copy(alpha = 0.85f),
        borderColor = if (asset.isSelected) {
            if (asset.isLocked) SoftAmberBorder else SpatialSapphireBorderStrong
        } else {
            SpatialSapphireBorderSoft
        },
        borderWidth = if (asset.isSelected) 1.4.dp else 1.dp
    ) {
        // Linha 1: Ticker, Categoria e Ações (Editar, Remover, Ativar/Desativar)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .background(
                            if (asset.isSelected) {
                                Brush.horizontalGradient(
                                    listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                )
                            } else {
                                Brush.horizontalGradient(
                                    listOf(Color(0xFF94A3B8), Color(0xFF64748B))
                                )
                            },
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = asset.ticker,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                CategoryChip(category = asset.category)
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onEdit, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar", tint = TextMuted, modifier = Modifier.size(16.dp))
                }
                IconButton(onClick = onRemove, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Remover", tint = Color(0xFFE57373), modifier = Modifier.size(16.dp))
                }
                Spacer(modifier = Modifier.width(4.dp))
                Switch(
                    checked = asset.isSelected,
                    onCheckedChange = onToggle,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = SpatialCobaltPrimary,
                        uncheckedThumbColor = Color.LightGray,
                        uncheckedTrackColor = SpatialSapphireBorderSoft
                    ),
                    modifier = Modifier
                        .scale(0.85f)
                        .testTag("toggle_${asset.ticker}")
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = asset.name,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = if (asset.isSelected) TextPrimary else TextMuted
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Linha 2: Controle "Travar Valor"
        // Estado inicial: desabilitado/inativo até que a cotação do ativo seja consultada/atualizada com sucesso
        val isLockControlEnabled = asset.isPriceUpdated && asset.isSelected
        Surface(
            shape = RoundedCornerShape(10.dp),
            color = when {
                !asset.isPriceUpdated -> SpatialGlassSurfaceVariant.copy(alpha = 0.5f)
                asset.isLocked -> SoftAmberBg
                else -> SpatialGlassSurfaceSubtle
            },
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                when {
                    !asset.isPriceUpdated -> SpatialSapphireBorderSoft.copy(alpha = 0.4f)
                    asset.isLocked -> SoftAmberBorder
                    else -> SpatialSapphireBorderSoft
                }
            ),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .clickable(enabled = isLockControlEnabled) {
                    onToggleLock(!asset.isLocked)
                }
                .testTag("lock_control_${asset.ticker}")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (asset.isLocked) Icons.Default.Lock else Icons.Default.LockOpen,
                        contentDescription = "Status de Trava",
                        tint = when {
                            !asset.isPriceUpdated -> TextMuted
                            asset.isLocked -> SoftAmber
                            else -> SpatialCobaltPrimary
                        },
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text(
                            text = when {
                                !asset.isPriceUpdated -> "Travar Valor (requer cotação atualizada)"
                                asset.isLocked -> "Valor Travado: ${formatCurrency(asset.totalValue)}"
                                else -> "Travar Valor (apto a receber aporte)"
                            },
                            fontSize = 11.sp,
                            fontWeight = if (asset.isLocked) FontWeight.Bold else FontWeight.Medium,
                            color = when {
                                !asset.isPriceUpdated -> TextMuted
                                asset.isLocked -> SoftAmber
                                else -> TextPrimary
                            }
                        )
                        if (asset.isLocked && asset.isPriceUpdated) {
                            Text(
                                text = "Alocação fixada • Não será alterada na distribuição",
                                fontSize = 10.sp,
                                color = SoftAmber.copy(alpha = 0.85f)
                            )
                        }
                    }
                }

                Switch(
                    checked = asset.isLocked,
                    enabled = isLockControlEnabled,
                    onCheckedChange = { onToggleLock(it) },
                    modifier = Modifier
                        .scale(0.70f)
                        .testTag("lock_toggle_${asset.ticker}"),
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = SoftAmber,
                        uncheckedThumbColor = if (isLockControlEnabled) TextMuted else Color.LightGray,
                        uncheckedTrackColor = SpatialSapphireBorderSoft.copy(alpha = 0.5f),
                        disabledCheckedThumbColor = Color.White.copy(alpha = 0.6f),
                        disabledCheckedTrackColor = SoftAmber.copy(alpha = 0.4f),
                        disabledUncheckedThumbColor = Color.LightGray.copy(alpha = 0.5f),
                        disabledUncheckedTrackColor = Color.Transparent
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Numbers Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SpatialGlassSurfaceSubtle, RoundedCornerShape(10.dp))
                .border(1.dp, SpatialSapphireBorderSoft.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                .padding(10.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text("V. Cota", fontSize = 10.sp, color = TextMuted)
                Text(formatCurrency(asset.currentPrice), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            }
            Column {
                Text("Cotas", fontSize = 10.sp, color = TextMuted)
                Text("${asset.shares}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            }
            Column {
                Text("Investido", fontSize = 10.sp, color = TextMuted)
                Text(formatCurrency(asset.totalValue), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SpatialCobaltPrimary)
            }
            Column {
                Text("Renda/Mês", fontSize = 10.sp, color = TextMuted)
                Text(formatCurrency(asset.monthlyIncome), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SoftGreen)
            }
            Column {
                Text("% Mês", fontSize = 10.sp, color = TextMuted)
                Text(formatPercent(asset.monthlyYieldPercent), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SoftGreen)
            }
        }
    }
}
