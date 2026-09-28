package com.example.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FiiAssetEntity
import com.example.ui.theme.PastelBlueBackground
import com.example.ui.theme.PastelBlueBorder
import com.example.ui.theme.PastelBlueContainer
import com.example.ui.theme.PastelBluePrimary
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.PastelBlueSurface
import com.example.ui.theme.PastelBlueSurfaceVariant
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Paleta moderna de cores para categorias de ativos inspirada no design system do Recharts.
 */
val CategoryRechartsColors = mapOf(
    "CRI / Papel" to Color(0xFF2563EB),           // Vibrant Blue
    "CRA / Fiagro" to Color(0xFF10B981),          // Emerald Green
    "Logística / Tijolo" to Color(0xFFF59E0B),    // Warm Amber
    "Shopping / Tijolo" to Color(0xFF8B5CF6),     // Purple
    "Terras / Agrícola" to Color(0xFF06B6D4),     // Cyan
    "Energia Alternativas" to Color(0xFFEC4899),  // Pink
    "ETF Renda Fixa" to Color(0xFF6366F1),        // Indigo
    "ETF Mundial" to Color(0xFF14B8A6),           // Teal
    "Outros" to Color(0xFF64748B)                 // Slate
)

val FallbackColors = listOf(
    Color(0xFF2563EB), Color(0xFF10B981), Color(0xFFF59E0B),
    Color(0xFF8B5CF6), Color(0xFF06B6D4), Color(0xFFEC4899),
    Color(0xFF6366F1), Color(0xFF14B8A6), Color(0xFFF97316),
    Color(0xFF84CC16)
)

data class PieCategorySlice(
    val categoryName: String,
    val value: Double,
    val percentage: Double,
    val color: Color,
    val startAngle: Float,
    val sweepAngle: Float,
    val assetCount: Int,
    val tickers: List<String>
)

/**
 * Gráfico de Pizza / Donut interativo inspirado no Recharts.
 * Oferece:
 * - Renderização de arcos proporcionais com espaçamento refinado
 * - Destaque dinâmico (Active Shape) ao tocar na fatia ou na legenda
 * - Tooltip interativo com dados detalhados da classe
 * - Legenda fluida com valores e percentuais
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CategoryPieChart(
    activeAssets: List<FiiAssetEntity>,
    modifier: Modifier = Modifier,
    totalPortfolioValue: Double = activeAssets.sumOf { it.totalValue }
) {
    var selectedCategoryIndex by remember { mutableStateOf<Int?>(null) }

    // Agrupa e processa as categorias
    val categoryGroups = remember(activeAssets, totalPortfolioValue) {
        if (totalPortfolioValue <= 0 || activeAssets.isEmpty()) return@remember emptyList<PieCategorySlice>()

        val grouped = activeAssets.groupBy { it.category }
        var currentAngle = -90f // Começa no topo (12 horas), padrão Recharts

        grouped.entries.mapIndexed { index, entry ->
            val catName = entry.key
            val assets = entry.value
            val catVal = assets.sumOf { it.totalValue }
            val pct = (catVal / totalPortfolioValue) * 100.0
            val sweep = (pct.toFloat() / 100f) * 360f

            val color = CategoryRechartsColors[catName]
                ?: FallbackColors[index % FallbackColors.size]

            val slice = PieCategorySlice(
                categoryName = catName,
                value = catVal,
                percentage = pct,
                color = color,
                startAngle = currentAngle,
                sweepAngle = sweep,
                assetCount = assets.size,
                tickers = assets.map { it.ticker }
            )
            currentAngle += sweep
            slice
        }
    }

    if (categoryGroups.isEmpty()) {
        SoftUiCard(
            modifier = modifier.fillMaxWidth(),
            backgroundColor = Color.White
        ) {
            Text(
                text = "Nenhum ativo alocado para exibição do gráfico de distribuição.",
                fontSize = 13.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
            )
        }
        return
    }

    val selectedSlice = selectedCategoryIndex?.let { categoryGroups.getOrNull(it) }

    SoftUiCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("recharts_pie_chart_card"),
        backgroundColor = Color.White
    ) {
        // Título da Seção do Gráfico
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .background(PastelBlueContainer, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PieChart,
                        contentDescription = null,
                        tint = PastelBluePrimary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Distribuição por Categoria",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PastelBluePrimaryDark
                    )
                    Text(
                        text = "Alocação percentual da carteira selecionada",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }

            Box(
                modifier = Modifier
                    .background(PastelBlueSurfaceVariant, RoundedCornerShape(8.dp))
                    .border(1.dp, PastelBlueBorder, RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "${categoryGroups.size} Classes",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PastelBluePrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Gráfico Donut com Interatividade de Toque
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(230.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(
                modifier = Modifier
                    .size(220.dp)
                    .testTag("pie_chart_canvas")
                    .pointerInput(categoryGroups) {
                        detectTapGestures { offset ->
                            val center = Offset(size.width / 2f, size.height / 2f)
                            val dx = offset.x - center.x
                            val dy = offset.y - center.y
                            val distance = sqrt(dx * dx + dy * dy)

                            val outerRadius = size.width / 2f
                            val innerRadius = outerRadius * 0.58f

                            // Toque no centro reseta a seleção
                            if (distance < innerRadius) {
                                selectedCategoryIndex = null
                                return@detectTapGestures
                            }

                            if (distance <= outerRadius + 20f) {
                                var angle = Math.toDegrees(atan2(dy.toDouble(), dx.toDouble())).toFloat()
                                // Normaliza o ângulo para bater com -90 graus no topo
                                if (angle < -90f) {
                                    angle += 360f
                                }
                                val normalizedAngle = angle

                                val tappedIndex = categoryGroups.indexOfFirst { slice ->
                                    val start = slice.startAngle
                                    val end = slice.startAngle + slice.sweepAngle
                                    normalizedAngle in start..end
                                }

                                selectedCategoryIndex = if (selectedCategoryIndex == tappedIndex) null else if (tappedIndex >= 0) tappedIndex else null
                            }
                        }
                    }
            ) {
                val canvasSize = size.minDimension
                val strokeWidth = 32.dp.toPx()
                val radius = (canvasSize - strokeWidth) / 2f
                val centerOffset = Offset(size.width / 2f, size.height / 2f)

                categoryGroups.forEachIndexed { index, slice ->
                    val isSelected = selectedCategoryIndex == index
                    val activeInflation = if (isSelected) 8.dp.toPx() else 0f
                    val currentStroke = if (isSelected) strokeWidth + 6.dp.toPx() else strokeWidth

                    // Efeito Recharts de espaçamento sutil entre fatias (gap de 2 graus)
                    val gap = if (categoryGroups.size > 1) 2.2f else 0f
                    val effectiveSweep = (slice.sweepAngle - gap).coerceAtLeast(0.5f)
                    val effectiveStart = slice.startAngle + (gap / 2f)

                    val sliceRadius = radius + activeInflation

                    drawArc(
                        color = slice.color,
                        startAngle = effectiveStart,
                        sweepAngle = effectiveSweep,
                        useCenter = false,
                        topLeft = Offset(centerOffset.x - sliceRadius, centerOffset.y - sliceRadius),
                        size = Size(sliceRadius * 2, sliceRadius * 2),
                        style = Stroke(width = currentStroke, cap = StrokeCap.Butt)
                    )
                }
            }

            // Centro do Donut: Resumo Global ou Ativo Selecionado
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { selectedCategoryIndex = null }
                    .padding(8.dp)
            ) {
                if (selectedSlice != null) {
                    Text(
                        text = selectedSlice.categoryName,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = selectedSlice.color,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${String.format(java.util.Locale.US, "%.1f", selectedSlice.percentage)}%",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = formatCurrency(selectedSlice.value),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                } else {
                    Text(
                        text = "TOTAL",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "100%",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = PastelBluePrimaryDark
                    )
                    Text(
                        text = formatCurrency(totalPortfolioValue),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tooltip Interativo Recharts (quando uma categoria está selecionada)
        if (selectedSlice != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(PastelBlueSurfaceVariant, RoundedCornerShape(12.dp))
                    .border(1.dp, selectedSlice.color.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp)
                    .testTag("recharts_tooltip_box")
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(selectedSlice.color, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = selectedSlice.categoryName,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }

                        Text(
                            text = "${String.format(java.util.Locale.US, "%.1f", selectedSlice.percentage)}%",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = selectedSlice.color
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Valor: ${formatCurrency(selectedSlice.value)}",
                            fontSize = 11.sp,
                            color = TextSecondary,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "${selectedSlice.assetCount} ativo(s): ${selectedSlice.tickers.joinToString(", ")}",
                            fontSize = 11.sp,
                            color = PastelBluePrimaryDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        // Legenda Interativa Estilo Recharts
        Text(
            text = "LEGENDA DE DISTRIBUIÇÃO (TOQUE PARA DESTACAR)",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = TextMuted,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            categoryGroups.forEachIndexed { index, slice ->
                val isSelected = selectedCategoryIndex == index
                val itemBg = if (isSelected) slice.color.copy(alpha = 0.15f) else PastelBlueSurfaceVariant
                val itemBorder = if (isSelected) slice.color else PastelBlueBorder

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(itemBg)
                        .border(1.dp, itemBorder, RoundedCornerShape(8.dp))
                        .clickable {
                            selectedCategoryIndex = if (isSelected) null else index
                        }
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .testTag("legend_item_${slice.categoryName.replace(" ", "_")}"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(9.dp)
                            .background(slice.color, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = slice.categoryName,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${String.format(java.util.Locale.US, "%.1f", slice.percentage)}%",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) slice.color else PastelBluePrimaryDark
                    )
                }
            }
        }
    }
}
