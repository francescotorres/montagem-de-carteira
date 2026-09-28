package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Balance
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import com.example.ui.components.CategoryChip
import com.example.ui.components.SpatialGlassCard
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatPercent
import com.example.ui.components.spatialEtherealBackground
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftAmber
import com.example.ui.theme.SoftAmberBg
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.SoftGreenBg
import com.example.ui.theme.SoftRed
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
import kotlin.math.roundToInt

@Composable
fun CategoryBalanceScreen(
    assets: List<FiiAssetEntity>,
    config: PortfolioConfigEntity,
    categoryTargets: List<CategoryTargetEntity>,
    onUpdateTargets: (List<CategoryTargetEntity>) -> Unit,
    onProfileSelected: (String) -> Unit = {},
    onRebalance: () -> Unit
) {
    val activeAssets = assets.filter { it.isSelected }
    val totalInvested = activeAssets.sumOf { it.totalValue }
    val longTermCapital = config.longTermValue

    // Categories present in assets or targets
    val allCategoryNames = (assets.map { it.category } + categoryTargets.map { it.categoryName }).distinct()

    val targetMap = remember(categoryTargets) {
        categoryTargets.associate { it.categoryName to it.targetPercentage }
    }

    val totalTargetPercent = categoryTargets.sumOf { it.targetPercentage }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .spatialEtherealBackground()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))

            // Seletor Rápido de Perfil no Balanceamento
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("balance_profile_selector_card"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorder
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Perfil da Carteira",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Balanceamento automático de FIIs e Fiagros",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
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
                                .padding(vertical = 8.dp)
                                .testTag("balance_profile_btn_$profile"),
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
            }
        }

        item {
            // Bloco: Balanceamento por Categoria
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("balance_header_card"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorder
            ) {
                // Linha 1 e 2: Título e Subtítulo
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .background(
                                Brush.linearGradient(
                                    listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                ),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Balance,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Balanceamento por Categoria",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Defina os pesos (%) alvo para cada segmento",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }

                // 2 linhas abaixo: Total percentual dos alvos
                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            if (totalTargetPercent.roundToInt() == 100) SoftGreenBg.copy(alpha = 0.85f) else SoftAmberBg.copy(alpha = 0.85f),
                            RoundedCornerShape(10.dp)
                        )
                        .border(
                            1.dp,
                            if (totalTargetPercent.roundToInt() == 100) SoftGreen.copy(alpha = 0.5f) else SoftAmber.copy(alpha = 0.5f),
                            RoundedCornerShape(10.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(
                                    if (totalTargetPercent.roundToInt() == 100) SoftGreen else SoftAmber,
                                    CircleShape
                                )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Total Percentual dos Alvos:",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(
                                if (totalTargetPercent.roundToInt() == 100) SoftGreen else SoftAmber,
                                RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Total: ${totalTargetPercent.roundToInt()}%",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SpatialGlassSurfaceSubtle, RoundedCornerShape(12.dp))
                        .border(1.dp, SpatialSapphireBorderSoft.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Capital Longo Prazo", fontSize = 11.sp, color = TextMuted)
                        Text(formatCurrency(longTermCapital), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SpatialCobaltPrimary)
                    }
                    Column {
                        Text("Total Alocado Atual", fontSize = 11.sp, color = TextMuted)
                        Text(formatCurrency(totalInvested), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Column {
                        Text("Diferença", fontSize = 11.sp, color = TextMuted)
                        val diff = longTermCapital - totalInvested
                        Text(
                            formatCurrency(diff),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (diff >= 0) SoftGreen else SoftRed
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Auto Rebalance Action Button
                Button(
                    onClick = onRebalance,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("apply_rebalance_button"),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SpatialCobaltPrimary)
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Recalcular Cotas pelo Alvo (%)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        // List of categories with target % adjustment
        items(allCategoryNames) { categoryName ->
            val catAssets = activeAssets.filter { it.category == categoryName }
            val catValue = catAssets.sumOf { it.totalValue }
            val currentPercent = if (totalInvested > 0) (catValue / totalInvested) * 100.0 else 0.0
            val targetPercent = targetMap[categoryName] ?: 0.0
            val targetValue = (targetPercent / 100.0) * longTermCapital
            val valueDiff = targetValue - catValue

            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("category_card_${categoryName.replace(" ", "_")}"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorderSoft
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CategoryChip(category = categoryName)

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = {
                                val newPercent = (targetPercent - 1.0).coerceAtLeast(0.0)
                                val updated = categoryTargets.map {
                                    if (it.categoryName == categoryName) it.copy(targetPercentage = newPercent) else it
                                }
                                onUpdateTargets(updated)
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Diminuir", tint = SpatialCobaltPrimary, modifier = Modifier.size(16.dp))
                        }

                        Text(
                            text = "${targetPercent.roundToInt()}%",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = SpatialCobaltPrimary,
                            modifier = Modifier.padding(horizontal = 4.dp)
                        )

                        IconButton(
                            onClick = {
                                val newPercent = (targetPercent + 1.0).coerceAtMost(100.0)
                                val updated = categoryTargets.map {
                                    if (it.categoryName == categoryName) it.copy(targetPercentage = newPercent) else it
                                }
                                onUpdateTargets(updated)
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Aumentar", tint = SpatialCobaltPrimary, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Slider
                Slider(
                    value = targetPercent.toFloat(),
                    onValueChange = { newVal ->
                        val updated = categoryTargets.map {
                            if (it.categoryName == categoryName) it.copy(targetPercentage = newVal.toDouble().roundToInt().toDouble()) else it
                        }
                        onUpdateTargets(updated)
                    },
                    valueRange = 0f..100f,
                    steps = 99,
                    colors = SliderDefaults.colors(
                        thumbColor = SpatialCobaltPrimary,
                        activeTrackColor = SpatialCobaltPrimary,
                        inactiveTrackColor = SpatialCobaltContainer
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                // Progress Bar: Current vs Target
                LinearProgressIndicator(
                    progress = { (currentPercent / 100.0).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = SpatialCobaltSecondary,
                    trackColor = SpatialGlassSurfaceSubtle
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Stats row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Alocado Atual", fontSize = 10.sp, color = TextMuted)
                        Text(
                            "${formatCurrency(catValue)} (${formatPercent(currentPercent)})",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Meta Alvo", fontSize = 10.sp, color = TextMuted)
                        Text(
                            "${formatCurrency(targetValue)} (${targetPercent.roundToInt()}%)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = SpatialCobaltPrimary
                        )
                    }
                }

                if (valueDiff != 0.0) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (valueDiff > 0) "Déficit: aporte sugerido de +${formatCurrency(valueDiff)}" else "Superávit de ${formatCurrency(-valueDiff)}",
                        fontSize = 11.sp,
                        color = if (valueDiff > 0) SoftGreen else SoftAmber,
                        fontWeight = FontWeight.Medium
                    )
                }

                if (catAssets.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Ativos vinculados: ${catAssets.joinToString { "${it.ticker} (${it.shares} cotas)" }}",
                        fontSize = 10.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
