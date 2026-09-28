package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.DefaultData
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import com.example.ui.components.CategoryChip
import com.example.ui.components.CategoryPieChart
import com.example.ui.components.SpatialGlassCard
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatPercent
import com.example.ui.components.spatialEtherealBackground
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.SoftGreenBg
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
fun ReportScreen(
    assets: List<FiiAssetEntity>,
    config: PortfolioConfigEntity
) {
    val context = LocalContext.current
    val activeAssets = assets.filter { it.isSelected }
    val totalCotas = activeAssets.sumOf { it.shares }
    val totalInvested = activeAssets.sumOf { it.totalValue }
    val totalMonthlyIncome = activeAssets.sumOf { it.monthlyIncome }
    val totalAnnualIncome = totalMonthlyIncome * 12.0
    val avgMonthlyYield = if (totalInvested > 0) (totalMonthlyIncome / totalInvested) * 100.0 else 0.0

    val reportText = buildReportText(config, activeAssets, totalCotas, totalInvested, totalMonthlyIncome, totalAnnualIncome, avgMonthlyYield)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .spatialEtherealBackground()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(4.dp))
            // Actions Row (Share & Copy)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, "Relatório Carteira FIIs - ${config.clientName}")
                            putExtra(Intent.EXTRA_TEXT, reportText)
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Compartilhar Relatório"))
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SpatialCobaltPrimary),
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .testTag("share_report_button")
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Compartilhar", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                }

                OutlinedButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("Relatório Carteira", reportText)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Relatório copiado para a área de transferência!", Toast.LENGTH_SHORT).show()
                    },
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.2.dp, SpatialSapphireBorder),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = SpatialGlassSurfaceVariant
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                        .testTag("copy_report_button")
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, tint = SpatialCobaltPrimary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copiar Texto", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SpatialCobaltPrimary)
                }
            }
        }

        // Executive Header Card
        item {
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("report_doc_header"),
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
                            text = "RELATÓRIO DE CARTEIRA RECOMENDADA",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SpatialCobaltPrimary,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "CLIENTE: ${config.clientName.uppercase()}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(SpatialCobaltContainer, RoundedCornerShape(8.dp))
                            .border(1.dp, SpatialSapphireBorderSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = config.dateStr,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = SpatialCobaltPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = SpatialSapphireBorderSoft.copy(alpha = 0.5f))
                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "VISÃO GERAL DO PLANEJAMENTO FINANCEIRO",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(8.dp))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SpatialGlassSurfaceSubtle, RoundedCornerShape(12.dp))
                        .border(1.dp, SpatialSapphireBorderSoft.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ReportKeyValue("Valor para investir", formatCurrency(config.totalToInvest))
                    ReportKeyValue("Fundo de Reserva (Líquido)", formatCurrency(config.reserveFund))
                    ReportKeyValue("Custos Mensais Declarados", formatCurrency(config.monthlyExpenses))
                    ReportKeyValue("Valor Efetivo para Longo Prazo", formatCurrency(config.longTermValue), isBold = true, color = SoftGreen)
                    ReportKeyValue("Reserva Ideal (${config.idealReserveMonths} meses - ${config.employmentType})", formatCurrency(config.idealReserveValue))
                    ReportKeyValue("Perfil do Investidor", config.investorProfile)
                }
            }
        }

        // Structured Table: CARTEIRA
        item {
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("report_table_card"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorder
            ) {
                Text(
                    text = "CARTEIRA - EXPECTATIVA DE RETORNO MENSAL",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Rendimento projetado baseado nas cotações e dividendos recentes",
                    fontSize = 11.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Horizontally scrollable table
                val tableScroll = rememberScrollState()
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(tableScroll)
                ) {
                    // Table Header
                    Row(
                        modifier = Modifier
                            .background(SpatialCobaltContainer, RoundedCornerShape(8.dp))
                            .border(1.dp, SpatialSapphireBorderSoft, RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        TableCell("COTA", width = 80.dp, isHeader = true)
                        TableCell("V. COTA", width = 85.dp, isHeader = true)
                        TableCell("COTAS", width = 65.dp, isHeader = true)
                        TableCell("VALOR (R$)", width = 95.dp, isHeader = true)
                        TableCell("RECEBIDO", width = 80.dp, isHeader = true)
                        TableCell("MENSAL (R$)", width = 95.dp, isHeader = true)
                        TableCell("ANUAL (R$)", width = 95.dp, isHeader = true)
                        TableCell("% MÊS", width = 65.dp, isHeader = true)
                    }

                    // Table Rows
                    activeAssets.forEachIndexed { idx, asset ->
                        Row(
                            modifier = Modifier
                                .background(if (idx % 2 == 0) SpatialGlassSurface else SpatialGlassSurfaceVariant)
                                .padding(horizontal = 8.dp, vertical = 7.dp)
                        ) {
                            TableCell(asset.ticker, width = 80.dp, isBold = true, color = SpatialCobaltPrimary)
                            TableCell(formatCurrency(asset.currentPrice), width = 85.dp)
                            TableCell("${asset.shares}", width = 65.dp)
                            TableCell(formatCurrency(asset.totalValue), width = 95.dp)
                            TableCell(formatCurrency(asset.lastDividend), width = 80.dp)
                            TableCell(formatCurrency(asset.monthlyIncome), width = 95.dp, color = SoftGreen, isBold = true)
                            TableCell(formatCurrency(asset.annualIncome), width = 95.dp)
                            TableCell(formatPercent(asset.monthlyYieldPercent), width = 65.dp)
                        }
                    }

                    // Table Totals
                    HorizontalDivider(color = SpatialSapphireBorderStrong, thickness = 2.dp)
                    Row(
                        modifier = Modifier
                            .background(SpatialCobaltContainer)
                            .padding(horizontal = 8.dp, vertical = 9.dp)
                    ) {
                        TableCell("TOTAL", width = 80.dp, isBold = true, color = SpatialCobaltPrimary)
                        TableCell("-", width = 85.dp)
                        TableCell("$totalCotas", width = 65.dp, isBold = true)
                        TableCell(formatCurrency(totalInvested), width = 95.dp, isBold = true, color = SpatialCobaltPrimary)
                        TableCell("-", width = 80.dp)
                        TableCell(formatCurrency(totalMonthlyIncome), width = 95.dp, isBold = true, color = SoftGreen)
                        TableCell(formatCurrency(totalAnnualIncome), width = 95.dp, isBold = true, color = SpatialCobaltPrimary)
                        TableCell(formatPercent(avgMonthlyYield), width = 65.dp, isBold = true, color = SoftGreen)
                    }
                }
            }
        }

        // Gráfico de Pizza / Donut da Distribuição por Categoria
        item {
            CategoryPieChart(
                activeAssets = activeAssets,
                totalPortfolioValue = totalInvested,
                modifier = Modifier.padding(vertical = 4.dp)
            )
        }

        // Section Title: Executive Resumes
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(
                            Brush.linearGradient(
                                listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                            ),
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Article,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "Resumo dos Ativos Selecionados",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Tese de investimento e análise de cada fundo imobiliário",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        // Resumes for each active asset
        items(activeAssets, key = { "resume_${it.ticker}" }) { asset ->
            SpatialGlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("resume_card_${asset.ticker}"),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorderSoft
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .background(
                                    Brush.horizontalGradient(
                                        listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                    ),
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

                    if (asset.gestora.isNotBlank()) {
                        Text(
                            text = asset.gestora,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = asset.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = asset.summaryText.ifBlank {
                        "${asset.name} (${asset.ticker}) é um ativo do segmento ${asset.category} focado na geração de proventos e valorização patrimonial."
                    },
                    fontSize = 12.sp,
                    color = TextSecondary,
                    lineHeight = 18.sp
                )
            }
        }

        // Section Title: Educational Terms "Descomplicando"
        item {
            Spacer(modifier = Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(
                            Brush.linearGradient(
                                listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                            ),
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.HelpOutline,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "Termos Utilizados (Descomplicando)",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Conceitos fundamentais explicados de forma simples e didática",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        // Educational terms items
        items(DefaultData.educationalTerms) { (term, definition) ->
            SpatialGlassCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = SpatialGlassSurface,
                borderColor = SpatialSapphireBorderSoft
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = SpatialCobaltPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = term,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = definition,
                    fontSize = 12.sp,
                    color = TextSecondary,
                    lineHeight = 17.sp
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun ReportKeyValue(
    key: String,
    value: String,
    isBold: Boolean = false,
    color: Color = TextPrimary
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(key, fontSize = 12.sp, color = TextSecondary)
        Text(value, fontSize = 12.sp, fontWeight = if (isBold) FontWeight.Bold else FontWeight.SemiBold, color = color)
    }
}

@Composable
fun TableCell(
    text: String,
    width: androidx.compose.ui.unit.Dp,
    isHeader: Boolean = false,
    isBold: Boolean = false,
    color: Color = TextPrimary
) {
    Text(
        text = text,
        fontSize = if (isHeader) 10.sp else 11.sp,
        fontWeight = if (isHeader || isBold) FontWeight.Bold else FontWeight.Normal,
        color = if (isHeader) SpatialCobaltPrimary else color,
        modifier = Modifier.width(width)
    )
}

fun buildReportText(
    config: PortfolioConfigEntity,
    assets: List<FiiAssetEntity>,
    totalCotas: Int,
    totalInvested: Double,
    monthlyIncome: Double,
    annualIncome: Double,
    avgYield: Double
): String {
    val sb = StringBuilder()
    sb.appendLine("==============================================")
    sb.appendLine("RELATÓRIO DE CARTEIRA RECOMENDADA - FIIs")
    sb.appendLine("==============================================")
    sb.appendLine("CLIENTE: ${config.clientName}")
    sb.appendLine("DATA: ${config.dateStr}")
    sb.appendLine("PERFIL: ${config.investorProfile}")
    sb.appendLine()
    sb.appendLine("--- VISÃO GERAL ---")
    sb.appendLine("• Valor para Investir: ${formatCurrency(config.totalToInvest)}")
    sb.appendLine("• Fundo de Reserva: ${formatCurrency(config.reserveFund)}")
    sb.appendLine("• Custos Mensais: ${formatCurrency(config.monthlyExpenses)}")
    sb.appendLine("• Valor para Longo Prazo: ${formatCurrency(config.longTermValue)}")
    sb.appendLine("• Reserva Ideal (${config.idealReserveMonths} meses): ${formatCurrency(config.idealReserveValue)}")
    sb.appendLine()
    sb.appendLine("--- EXPECTATIVA DE RETORNO DA CARTEIRA ---")
    sb.appendLine("• Renda Mensal Estimada: ${formatCurrency(monthlyIncome)}")
    sb.appendLine("• Renda Anual Estimada: ${formatCurrency(annualIncome)}")
    sb.appendLine("• Rentabilidade Mensal Média: ${formatPercent(avgYield)}")
    sb.appendLine("• Total Efetivamente Alocado: ${formatCurrency(totalInvested)} ($totalCotas cotas)")
    sb.appendLine()
    sb.appendLine("--- ATIVOS DA CARTEIRA ---")
    assets.forEach { a ->
        sb.appendLine("${a.ticker} - ${a.name}")
        sb.appendLine("  Categoria: ${a.category} | Gestora: ${a.gestora.ifBlank { "N/A" }}")
        sb.appendLine("  Preço: ${formatCurrency(a.currentPrice)} | Cotas: ${a.shares} | Total: ${formatCurrency(a.totalValue)}")
        sb.appendLine("  Dividendo: ${formatCurrency(a.lastDividend)}/mês | Renda: ${formatCurrency(a.monthlyIncome)}/mês (${formatPercent(a.monthlyYieldPercent)})")
        sb.appendLine()
    }
    sb.appendLine("--- RESUMO EXECUTIVO DOS ATIVOS ---")
    assets.forEach { a ->
        sb.appendLine("【${a.ticker}】 ${a.name}")
        sb.appendLine(a.summaryText)
        sb.appendLine()
    }
    sb.appendLine("--- TERMOS UTILIZADOS (DESCOMPLICANDO) ---")
    DefaultData.educationalTerms.forEach { (t, d) ->
        sb.appendLine("• $t: $d")
    }
    sb.appendLine("==============================================")
    return sb.toString()
}
