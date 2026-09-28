package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.FiiAssetEntity
import com.example.data.network.ScrapedMarketData
import com.example.ui.theme.PastelBlueBackground
import com.example.ui.theme.PastelBlueBorder
import com.example.ui.theme.PastelBluePrimary
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddEditAssetDialog(
    initialAsset: FiiAssetEntity? = null,
    onDismiss: () -> Unit,
    onSearchOnline: suspend (String) -> ScrapedMarketData,
    onSave: (FiiAssetEntity) -> Unit
) {
    var ticker by remember { mutableStateOf(initialAsset?.ticker ?: "") }
    var name by remember { mutableStateOf(initialAsset?.name ?: "") }
    var category by remember { mutableStateOf(initialAsset?.category ?: "CRI / Papel") }
    var priceText by remember { mutableStateOf(initialAsset?.currentPrice?.toString() ?: "10.00") }
    var dividendText by remember { mutableStateOf(initialAsset?.lastDividend?.toString() ?: "0.10") }
    var sharesText by remember { mutableStateOf(initialAsset?.shares?.toString() ?: "100") }
    var gestora by remember { mutableStateOf(initialAsset?.gestora ?: "") }
    var summary by remember { mutableStateOf(initialAsset?.summaryText ?: "") }

    var isSearching by remember { mutableStateOf(false) }
    var searchFeedback by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val categories = listOf(
        "CRA / Fiagro",
        "CRI / Papel",
        "Logística / Tijolo",
        "Terras / Agrícola",
        "Shopping / Tijolo",
        "ETF Mundial",
        "Energia Alternativas",
        "ETF Renda Fixa",
        "Outros"
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (initialAsset == null) "Adicionar Ativo (FII)" else "Editar Ativo",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PastelBluePrimaryDark
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Fechar",
                            tint = TextMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Ticker with Search Button
                Text("Código do Ativo / Ticker", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = ticker,
                        onValueChange = { ticker = it.uppercase().trim() },
                        placeholder = { Text("Ex: MXRF11, HGLG11, KNCR11") },
                        enabled = initialAsset == null,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("ticker_input_field"),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.Black,
                            unfocusedTextColor = Color.Black,
                            disabledTextColor = Color.Black,
                            focusedBorderColor = PastelBluePrimary,
                            unfocusedBorderColor = PastelBlueBorder,
                            cursorColor = Color.Black
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (ticker.isNotBlank()) {
                                scope.launch {
                                    isSearching = true
                                    searchFeedback = null
                                    val result = onSearchOnline(ticker)
                                    isSearching = false
                                    if (result.success && result.price != null) {
                                        priceText = String.format(java.util.Locale.US, "%.2f", result.price)
                                        if (result.lastDividend != null) {
                                            dividendText = String.format(java.util.Locale.US, "%.4f", result.lastDividend)
                                        }
                                        if (!result.name.isNullOrBlank()) {
                                            name = result.name
                                        }
                                        searchFeedback = "Dados carregados com sucesso do Investidor10!"
                                    } else {
                                        searchFeedback = "Cotação não localizada automaticamente. Preencha manualmente."
                                    }
                                }
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PastelBluePrimary),
                        modifier = Modifier.testTag("search_investidor_button")
                    ) {
                        if (isSearching) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.Search, contentDescription = "Buscar", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Buscar", fontSize = 12.sp)
                        }
                    }
                }

                if (searchFeedback != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = searchFeedback!!,
                        fontSize = 11.sp,
                        color = if (searchFeedback!!.contains("sucesso")) SoftGreen else Color(0xFFC0392B)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Name
                Text("Nome do Fundo / Ativo", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    placeholder = { Text("Nome completo ou resumido") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black,
                        disabledTextColor = Color.Black,
                        focusedBorderColor = PastelBluePrimary,
                        unfocusedBorderColor = PastelBlueBorder,
                        cursorColor = Color.Black
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Category Selection
                Text("Categoria / Segmento", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    categories.forEach { cat ->
                        val isCatSelected = category == cat
                        Box(
                            modifier = Modifier
                                .background(
                                    if (isCatSelected) PastelBluePrimary else PastelBlueBackground,
                                    RoundedCornerShape(8.dp)
                                )
                                .border(
                                    1.dp,
                                    if (isCatSelected) PastelBluePrimary else PastelBlueBorder,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { category = cat }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = cat,
                                fontSize = 11.sp,
                                fontWeight = if (isCatSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isCatSelected) Color.White else TextPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Price and Dividend row
                Row(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Cotação (R$)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = priceText,
                            onValueChange = { priceText = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black,
                                disabledTextColor = Color.Black,
                                focusedBorderColor = PastelBluePrimary,
                                unfocusedBorderColor = PastelBlueBorder,
                                cursorColor = Color.Black
                            )
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Dividendo/Mês (R$)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = dividendText,
                            onValueChange = { dividendText = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black,
                                disabledTextColor = Color.Black,
                                focusedBorderColor = PastelBluePrimary,
                                unfocusedBorderColor = PastelBlueBorder,
                                cursorColor = Color.Black
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Shares and Gestora
                Row(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Quantidade de Cotas", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = sharesText,
                            onValueChange = { sharesText = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black,
                                disabledTextColor = Color.Black,
                                focusedBorderColor = PastelBluePrimary,
                                unfocusedBorderColor = PastelBlueBorder,
                                cursorColor = Color.Black
                            )
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Gestora (Opcional)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = gestora,
                            onValueChange = { gestora = it },
                            placeholder = { Text("Ex: Kinea, Itaú") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black,
                                disabledTextColor = Color.Black,
                                focusedBorderColor = PastelBluePrimary,
                                unfocusedBorderColor = PastelBlueBorder,
                                cursorColor = Color.Black
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Summary / Tese
                Text("Resumo do Ativo / Tese (para o Relatório)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = summary,
                    onValueChange = { summary = it },
                    placeholder = { Text("Pequeno resumo explicativo sobre o fundo, sua estratégia e histórico...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(100.dp),
                    shape = RoundedCornerShape(12.dp),
                    textStyle = androidx.compose.ui.text.TextStyle(color = Color.Black),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.Black,
                        unfocusedTextColor = Color.Black,
                        disabledTextColor = Color.Black,
                        focusedBorderColor = PastelBluePrimary,
                        unfocusedBorderColor = PastelBlueBorder,
                        cursorColor = Color.Black
                    )
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancelar", color = TextSecondary)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Button(
                        onClick = {
                            if (ticker.isNotBlank()) {
                                val price = priceText.replace(",", ".").toDoubleOrNull() ?: 10.0
                                val dividend = dividendText.replace(",", ".").toDoubleOrNull() ?: 0.0
                                val shares = sharesText.toIntOrNull() ?: 0
                                val resolvedName = if (name.isNotBlank()) name else ticker
                                val segment = when {
                                    category.contains("Fiagro") -> "Fiagro"
                                    category.contains("Papel") -> "Papel"
                                    category.contains("ETF") -> "ETF"
                                    category.contains("Renda Fixa") -> "Renda Fixa"
                                    else -> "Tijolo"
                                }
                                val assetToSave = FiiAssetEntity(
                                    ticker = ticker,
                                    name = resolvedName,
                                    category = category,
                                    segmentType = segment,
                                    currentPrice = price,
                                    lastDividend = dividend,
                                    shares = shares,
                                    targetPercentage = initialAsset?.targetPercentage ?: 10.0,
                                    isSelected = true,
                                    summaryText = if (summary.isNotBlank()) summary else "$resolvedName ($ticker) - Fundo de investimento focado em $category com proventos mensais.",
                                    gestora = gestora
                                )
                                onSave(assetToSave)
                                onDismiss()
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PastelBluePrimary),
                        modifier = Modifier.testTag("save_asset_button")
                    ) {
                        Text("Salvar Ativo", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
