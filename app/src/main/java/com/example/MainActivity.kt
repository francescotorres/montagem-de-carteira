package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.FiiAssetEntity
import com.example.ui.components.MagneticDock
import com.example.ui.components.SoftUiPillTab
import com.example.ui.dialogs.AddEditAssetDialog
import com.example.ui.dialogs.EditClientConfigDialog
import com.example.ui.screens.CategoryBalanceScreen
import com.example.ui.screens.PortfolioScreen
import com.example.ui.screens.ReportScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.PastelBlueBackground
import com.example.ui.theme.PastelBlueBorder
import com.example.ui.theme.PastelBlueContainer
import com.example.ui.theme.PastelBluePrimary
import com.example.ui.theme.PastelBluePrimaryDark
import com.example.ui.theme.PastelBlueSecondary
import com.example.ui.theme.PastelBlueSurface
import androidx.compose.ui.graphics.Brush
import com.example.ui.theme.SpatialCobaltPrimary
import com.example.ui.theme.SpatialCobaltSecondary
import com.example.ui.theme.SpatialEtherealBgTop
import com.example.ui.theme.SpatialSapphireBorderSoft
import com.example.ui.theme.SpatialSapphireBorderStrong
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.viewmodel.PortfolioViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainApp()
            }
        }
    }
}

@Composable
fun MainApp(
    viewModel: PortfolioViewModel = viewModel()
) {
    val assets by viewModel.allAssets.collectAsStateWithLifecycle()
    val config by viewModel.portfolioConfig.collectAsStateWithLifecycle()
    val categoryTargets by viewModel.categoryTargets.collectAsStateWithLifecycle()
    val isRefreshing by viewModel.isRefreshing.collectAsStateWithLifecycle()
    val isDistributing by viewModel.isDistributing.collectAsStateWithLifecycle()
    val userMessage by viewModel.userMessage.collectAsStateWithLifecycle()
    val selectedTab by viewModel.selectedTab.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    var showAddEditDialog by remember { mutableStateOf(false) }
    var assetToEdit by remember { mutableStateOf<FiiAssetEntity?>(null) }
    var showConfigDialog by remember { mutableStateOf(false) }
    var showResetDialog by remember { mutableStateOf(false) }

    LaunchedEffect(userMessage) {
        userMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUserMessage()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = PastelBlueBackground,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.statusBars)
                    .background(PastelBlueBackground)
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                // Top App Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.Transparent,
                            border = androidx.compose.foundation.BorderStroke(1.dp, SpatialSapphireBorderSoft),
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    Brush.linearGradient(
                                        listOf(SpatialCobaltPrimary, SpatialCobaltSecondary)
                                    ),
                                    RoundedCornerShape(12.dp)
                                )
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.AccountBalanceWallet,
                                    contentDescription = "App Icon",
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Montagem de Carteiras",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Planejamento, Cotações & Relatórios",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    IconButton(
                        onClick = { showResetDialog = true },
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("reset_defaults_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.RestartAlt,
                            contentDescription = "Restaurar Padrões da Planilha",
                            tint = PastelBlueSecondary,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }
        },
        bottomBar = {
            val activeCount = assets.count { it.isSelected }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(bottom = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                MagneticDock(
                    selectedTab = selectedTab,
                    onTabSelected = { viewModel.selectTab(it) },
                    activeCount = activeCount
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> PortfolioScreen(
                    assets = assets,
                    config = config,
                    isRefreshing = isRefreshing,
                    isDistributing = isDistributing,
                    onProfileSelected = { viewModel.setInvestorProfile(it) },
                    onToggleAsset = { ticker, isSelected -> viewModel.toggleAsset(ticker, isSelected) },
                    onToggleAssetLock = { ticker, isLocked -> viewModel.toggleAssetLock(ticker, isLocked) },
                    onDistributeValue = { viewModel.distributeValue() },
                    onUpdateShares = { ticker, count -> viewModel.updateShares(ticker, count) },
                    onRemoveAsset = { viewModel.removeAsset(it) },
                    onEditAsset = {
                        assetToEdit = it
                        showAddEditDialog = true
                    },
                    onAddAssetClick = {
                        assetToEdit = null
                        showAddEditDialog = true
                    },
                    onEditConfigClick = { showConfigDialog = true },
                    onRefreshQuotes = { viewModel.refreshQuotesOnline() },
                    onToggleAllAssets = { activate -> viewModel.toggleAllAssets(activate) },
                    onRebalance = { viewModel.rebalance() }
                )
                1 -> CategoryBalanceScreen(
                    assets = assets,
                    config = config,
                    categoryTargets = categoryTargets,
                    onUpdateTargets = { viewModel.updateCategoryTargets(it) },
                    onProfileSelected = { viewModel.setInvestorProfile(it) },
                    onRebalance = { viewModel.rebalance() }
                )
                2 -> ReportScreen(
                    assets = assets,
                    config = config
                )
            }
        }
    }

    // Add / Edit Asset Dialog
    if (showAddEditDialog) {
        AddEditAssetDialog(
            initialAsset = assetToEdit,
            onDismiss = { showAddEditDialog = false },
            onSearchOnline = { ticker -> viewModel.searchOnlineQuote(ticker) },
            onSave = { asset -> viewModel.saveAsset(asset) }
        )
    }

    // Edit Client Config Dialog
    if (showConfigDialog) {
        EditClientConfigDialog(
            currentConfig = config,
            onDismiss = { showConfigDialog = false },
            onSave = { updated -> viewModel.updateConfig(updated) }
        )
    }

    // Reset Confirmation Dialog
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            shape = RoundedCornerShape(20.dp),
            containerColor = Color.White,
            title = {
                Text(
                    text = "Restaurar Valores Originais?",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = PastelBluePrimaryDark
                )
            },
            text = {
                Text(
                    text = "Isso irá restaurar todos os 10 ativos, valores, cotas e percentuais originais da planilha e do documento.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetDefaults()
                        showResetDialog = false
                    },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PastelBluePrimary)
                ) {
                    Text("Restaurar")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showResetDialog = false },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Cancelar", color = TextSecondary)
                }
            }
        )
    }
}
