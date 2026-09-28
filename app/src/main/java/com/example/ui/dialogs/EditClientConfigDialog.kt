package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDefaults
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.PortfolioConfigEntity
import com.example.ui.components.formatCurrency
import com.example.ui.theme.PastelBlueBackground
import com.example.ui.theme.PastelBlueBorder
import com.example.ui.theme.PastelBluePrimary
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.SoftGreen
import com.example.ui.theme.SoftGreenBg
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Format numbers in Brazilian Real pattern without the "R$" prefix (e.g. 150.000,00)
 */
fun formatBrazilianValue(amount: Double): String {
    val nf = NumberFormat.getNumberInstance(Locale("pt", "BR")).apply {
        minimumFractionDigits = 2
        maximumFractionDigits = 2
    }
    return nf.format(amount)
}

/**
 * Robust parser for Brazilian currency strings (supporting dots as thousands and comma as decimal)
 */
fun parseBrazilianCurrency(text: String): Double {
    if (text.isBlank()) return 0.0
    val clean = text.replace("R$", "").replace(" ", "").trim()
    return try {
        if (clean.contains(",") && clean.contains(".")) {
            clean.replace(".", "").replace(",", ".").toDouble()
        } else if (clean.contains(",")) {
            clean.replace(",", ".").toDouble()
        } else if (clean.contains(".")) {
            val parts = clean.split(".")
            if (parts.size > 2 || (parts.size == 2 && parts[1].length == 3)) {
                clean.replace(".", "").toDouble()
            } else {
                clean.toDouble()
            }
        } else {
            clean.toDouble()
        }
    } catch (e: Exception) {
        0.0
    }
}

private fun parseDateToUtcMillis(dateStr: String): Long {
    return try {
        val sdf = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val parsed = sdf.parse(dateStr)
        parsed?.time ?: System.currentTimeMillis()
    } catch (e: Exception) {
        System.currentTimeMillis()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditClientConfigDialog(
    currentConfig: PortfolioConfigEntity,
    onDismiss: () -> Unit,
    onSave: (PortfolioConfigEntity) -> Unit
) {
    // Client name always in uppercase
    var clientName by remember { mutableStateOf(currentConfig.clientName.uppercase()) }

    // Date always defaults to today's date as preview
    val todayFormatted = remember {
        SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR")).format(Date())
    }
    var dateStr by remember { mutableStateOf(todayFormatted) }
    var showDatePickerModal by remember { mutableStateOf(false) }

    // Financial values in Brazilian currency format (e.g. 150.000,00)
    var totalInvestText by remember { mutableStateOf(formatBrazilianValue(currentConfig.totalToInvest)) }
    var reserveText by remember { mutableStateOf(formatBrazilianValue(currentConfig.reserveFund)) }
    var monthlyExpensesText by remember { mutableStateOf(formatBrazilianValue(currentConfig.monthlyExpenses)) }
    var employmentType by remember { mutableStateOf(currentConfig.employmentType) }

    val totalInvest = parseBrazilianCurrency(totalInvestText)
    val reserve = parseBrazilianCurrency(reserveText)
    val monthlyExpenses = parseBrazilianCurrency(monthlyExpensesText)
    val longTerm = (totalInvest - reserve).coerceAtLeast(0.0)
    val idealMonths = if (employmentType == "SERVIDOR") 3 else 6
    val idealReserve = monthlyExpenses * idealMonths

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
                        text = "Dados da Proposta & Cliente",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PastelBluePrimaryDark
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Fechar", tint = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Name & Date row
                Row(modifier = Modifier.fillMaxWidth()) {
                    // Client Name (All uppercase, black text)
                    Column(modifier = Modifier.weight(1.25f)) {
                        Text(
                            text = "Nome do Cliente",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = clientName,
                            onValueChange = { clientName = it.uppercase() },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("client_name_input"),
                            keyboardOptions = KeyboardOptions(
                                capitalization = KeyboardCapitalization.Characters
                            ),
                            textStyle = TextStyle(
                                color = Color.Black,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.Black,
                                unfocusedTextColor = Color.Black,
                                disabledTextColor = Color.Black,
                                errorTextColor = Color.Black,
                                focusedBorderColor = PastelBluePrimary,
                                unfocusedBorderColor = PastelBlueBorder,
                                cursorColor = Color.Black
                            )
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // Date (Calendar format with today's date as preview, black text)
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Data da Proposta",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showDatePickerModal = true }
                        ) {
                            OutlinedTextField(
                                value = dateStr,
                                onValueChange = { /* Read-only via calendar dialog */ },
                                readOnly = true,
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("date_input"),
                                textStyle = TextStyle(
                                    color = Color.Black,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold
                                ),
                                trailingIcon = {
                                    IconButton(onClick = { showDatePickerModal = true }) {
                                        Icon(
                                            imageVector = Icons.Default.CalendarMonth,
                                            contentDescription = "Escolher data no calendário",
                                            tint = PastelBluePrimary
                                        )
                                    }
                                },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.Black,
                                    unfocusedTextColor = Color.Black,
                                    disabledTextColor = Color.Black,
                                    focusedBorderColor = PastelBluePrimary,
                                    unfocusedBorderColor = PastelBlueBorder,
                                    cursorColor = Color.Black
                                )
                            )
                            // Transparent clickable overlay ensuring any tap on field opens calendar
                            Box(
                                modifier = Modifier
                                    .matchParentSize()
                                    .clickable { showDatePickerModal = true }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Total Investment in Brazilian Currency Format (R$ 150.000,00) with Black Text
                BrazilianCurrencyInput(
                    label = "Valor Total para Investir",
                    value = totalInvestText,
                    onValueChange = { totalInvestText = it },
                    testTag = "total_invest_input",
                    quickPills = listOf(
                        "+10 mil" to 10000.0,
                        "+50 mil" to 50000.0,
                        "+100 mil" to 100000.0
                    ),
                    onQuickAdd = { addVal ->
                        val current = parseBrazilianCurrency(totalInvestText)
                        totalInvestText = formatBrazilianValue(current + addVal)
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Reserve Fund and Monthly Expenses in Brazilian Currency Format with Black Text
                Row(modifier = Modifier.fillMaxWidth()) {
                    BrazilianCurrencyInput(
                        label = "Fundo de Reserva",
                        value = reserveText,
                        onValueChange = { reserveText = it },
                        testTag = "reserve_input",
                        modifier = Modifier.weight(1f),
                        quickPills = listOf(
                            "+5 mil" to 5000.0,
                            "+10 mil" to 10000.0
                        ),
                        onQuickAdd = { addVal ->
                            val current = parseBrazilianCurrency(reserveText)
                            reserveText = formatBrazilianValue(current + addVal)
                        }
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    BrazilianCurrencyInput(
                        label = "Custos Mensais",
                        value = monthlyExpensesText,
                        onValueChange = { monthlyExpensesText = it },
                        testTag = "monthly_expenses_input",
                        modifier = Modifier.weight(1f),
                        quickPills = listOf(
                            "+500" to 500.0,
                            "+1.000" to 1000.0
                        ),
                        onQuickAdd = { addVal ->
                            val current = parseBrazilianCurrency(monthlyExpensesText)
                            monthlyExpensesText = formatBrazilianValue(current + addVal)
                        }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Employment Type for Reserve Fund Calculation
                Text(
                    text = "Regime de Trabalho (Cálculo Reserva Ideal)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    listOf("CLT / Autônomo" to "CLT", "Servidor Público" to "SERVIDOR").forEach { (label, key) ->
                        val isSelected = employmentType == key
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .background(
                                    if (isSelected) PastelBluePrimary else PastelBlueBackground,
                                    RoundedCornerShape(10.dp)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) PastelBluePrimary else PastelBlueBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { employmentType = key }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else Color.Black
                            )
                        }
                        if (key == "CLT") Spacer(modifier = Modifier.width(8.dp))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Calculated Summary Inset (All values in high-contrast Black)
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = SoftGreenBg,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SoftGreen.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Valor para Longo Prazo:", fontSize = 13.sp, color = TextSecondary)
                            Text(
                                text = formatCurrency(longTerm),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Reserva Ideal ($idealMonths meses):", fontSize = 13.sp, color = TextSecondary)
                            Text(
                                text = formatCurrency(idealReserve),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancelar", color = Color.Black)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Button(
                        onClick = {
                            val parsedTotal = parseBrazilianCurrency(totalInvestText)
                            val parsedReserve = parseBrazilianCurrency(reserveText)
                            val parsedMonthly = parseBrazilianCurrency(monthlyExpensesText)
                            onSave(
                                currentConfig.copy(
                                    clientName = if (clientName.isNotBlank()) clientName.trim().uppercase() else "CLIENTE",
                                    dateStr = dateStr,
                                    totalToInvest = parsedTotal,
                                    reserveFund = parsedReserve,
                                    monthlyExpenses = parsedMonthly,
                                    employmentType = employmentType
                                )
                            )
                            onDismiss()
                        },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PastelBluePrimary),
                        modifier = Modifier.testTag("save_config_button")
                    ) {
                        Text("Salvar Alterações", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }

    // Material 3 DatePickerDialog Modal
    if (showDatePickerModal) {
        val initialMillis = remember(dateStr) { parseDateToUtcMillis(dateStr) }
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = initialMillis
        )

        DatePickerDialog(
            onDismissRequest = { showDatePickerModal = false },
            confirmButton = {
                Button(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
                            calendar.timeInMillis = millis
                            val sdf = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))
                            sdf.timeZone = TimeZone.getTimeZone("UTC")
                            dateStr = sdf.format(calendar.time)
                        }
                        showDatePickerModal = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PastelBluePrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Confirmar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showDatePickerModal = false },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Cancelar", color = Color.Black)
                }
            },
            colors = DatePickerDefaults.colors(
                containerColor = Color.White
            )
        ) {
            DatePicker(
                state = datePickerState,
                colors = DatePickerDefaults.colors(
                    containerColor = Color.White,
                    titleContentColor = PastelBluePrimaryDark,
                    headlineContentColor = PastelBluePrimaryDark,
                    selectedDayContainerColor = PastelBluePrimary,
                    selectedDayContentColor = Color.White,
                    todayDateBorderColor = PastelBluePrimary,
                    todayContentColor = PastelBluePrimary
                )
            )
        }
    }
}

/**
 * Component for Brazilian Currency Input (displays "R$ 150.000,00" with pure black letters)
 */
@Composable
private fun BrazilianCurrencyInput(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    testTag: String,
    modifier: Modifier = Modifier,
    quickPills: List<Pair<String, Double>> = emptyList(),
    onQuickAdd: (Double) -> Unit = {}
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = TextSecondary
        )
        Spacer(modifier = Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = { input ->
                // Allow digits, comma and dots
                val filtered = input.filter { it.isDigit() || it == ',' || it == '.' }
                onValueChange(filtered)
            },
            prefix = {
                Text(
                    text = "R$ ",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag(testTag)
                .onFocusChanged { focusState ->
                    if (!focusState.isFocused && value.isNotBlank()) {
                        val parsed = parseBrazilianCurrency(value)
                        onValueChange(formatBrazilianValue(parsed))
                    }
                },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            textStyle = TextStyle(
                color = Color.Black,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            ),
            trailingIcon = {
                if (value.isNotEmpty() && value != "0,00" && value != "0") {
                    IconButton(
                        onClick = { onValueChange("0,00") },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Limpar valor",
                            tint = TextMuted,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.Black,
                unfocusedTextColor = Color.Black,
                disabledTextColor = Color.Black,
                errorTextColor = Color.Black,
                focusedPrefixColor = Color.Black,
                unfocusedPrefixColor = Color.Black,
                focusedBorderColor = PastelBluePrimary,
                unfocusedBorderColor = PastelBlueBorder,
                cursorColor = Color.Black
            )
        )

        if (quickPills.isNotEmpty()) {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                quickPills.forEach { (pillLabel, addAmount) ->
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = PastelBlueBackground,
                        border = androidx.compose.foundation.BorderStroke(1.dp, PastelBlueBorder),
                        modifier = Modifier.clickable { onQuickAdd(addAmount) }
                    ) {
                        Text(
                            text = pillLabel,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = PastelBluePrimaryDark,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        }
    }
}
