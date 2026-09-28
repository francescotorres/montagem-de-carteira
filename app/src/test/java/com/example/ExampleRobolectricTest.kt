package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.DefaultData
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Montagem de Carteiras", appName)
  }

  @Test
  fun `fii asset calculations test`() {
    val asset = FiiAssetEntity(
      ticker = "KNCR11",
      name = "Kinea Rendimentos Imobiliários",
      category = "CRI / Papel",
      segmentType = "Papel",
      currentPrice = 100.0,
      lastDividend = 1.0,
      shares = 100,
      targetPercentage = 10.0
    )
    assertEquals(10000.0, asset.totalValue, 0.01)
    assertEquals(100.0, asset.monthlyIncome, 0.01)
    assertEquals(1200.0, asset.annualIncome, 0.01)
    assertEquals(1.0, asset.monthlyYieldPercent, 0.01)
  }

  @Test
  fun `portfolio reserve calculations test`() {
    val configClt = PortfolioConfigEntity(
      totalToInvest = 150000.0,
      reserveFund = 30000.0,
      monthlyExpenses = 6000.0,
      employmentType = "CLT"
    )
    assertEquals(120000.0, configClt.longTermValue, 0.01)
    assertEquals(6, configClt.idealReserveMonths)
    assertEquals(36000.0, configClt.idealReserveValue, 0.01)

    val configServidor = configClt.copy(employmentType = "SERVIDOR")
    assertEquals(3, configServidor.idealReserveMonths)
    assertEquals(18000.0, configServidor.idealReserveValue, 0.01)
  }

  @Test
  fun `default assets list contains 10 items`() {
    assertEquals(10, DefaultData.defaultAssets.size)
    val tickers = DefaultData.defaultAssets.map { it.ticker }
    assertTrue(tickers.contains("KNCR11"))
    assertTrue(tickers.contains("RZAG11"))
    assertTrue(tickers.contains("WRLD11"))
    assertTrue(tickers.contains("LLFT11"))
  }

  @Test
  fun `brazilian currency parser test`() {
    assertEquals(150000.0, com.example.ui.dialogs.parseBrazilianCurrency("150.000,00"), 0.01)
    assertEquals(150000.0, com.example.ui.dialogs.parseBrazilianCurrency("150000"), 0.01)
    assertEquals(30000.0, com.example.ui.dialogs.parseBrazilianCurrency("R$ 30.000,00"), 0.01)
    assertEquals(6000.0, com.example.ui.dialogs.parseBrazilianCurrency("6.000,00"), 0.01)
    assertEquals(6000.0, com.example.ui.dialogs.parseBrazilianCurrency("6000"), 0.01)
    assertEquals(1250.75, com.example.ui.dialogs.parseBrazilianCurrency("1.250,75"), 0.01)
  }

  @Test
  fun `brazilian currency formatter test`() {
    val formatted = com.example.ui.dialogs.formatBrazilianValue(150000.0)
    assertTrue(formatted.contains("150.000") && formatted.contains("00"))
  }

  @Test
  fun `portfolio balancing engine rules test`() {
    val conservador = com.example.viewmodel.PortfolioBalancingEngine.getRule("CONSERVADOR")
    assertEquals(45.0, conservador.categoryWeights["CRI / Papel"] ?: 0.0, 0.01)
    assertEquals(0.0, conservador.categoryWeights["CRA / Fiagro"] ?: 0.0, 0.01)
    assertTrue(conservador.prioritizedTickers.contains("KNCR11"))

    val agressivo = com.example.viewmodel.PortfolioBalancingEngine.getRule("AGRESSIVO")
    assertEquals(28.0, agressivo.categoryWeights["CRA / Fiagro"] ?: 0.0, 0.01)
    assertEquals(0.0, agressivo.categoryWeights["CRI / Papel"] ?: 0.0, 0.01)
    assertTrue(agressivo.prioritizedTickers.contains("RZAG11"))
  }

  @Test
  fun `default client name is FULANO test`() {
    assertEquals("FULANO", DefaultData.defaultPortfolioConfig.clientName)
    val entity = PortfolioConfigEntity()
    assertEquals("FULANO", entity.clientName)
  }

  @Test
  fun `category recharts colors palette test`() {
    val colors = com.example.ui.components.CategoryRechartsColors
    assertTrue(colors.containsKey("CRI / Papel"))
    assertTrue(colors.containsKey("CRA / Fiagro"))
    assertTrue(colors.containsKey("Logística / Tijolo"))
    assertEquals(androidx.compose.ui.graphics.Color(0xFF2563EB), colors["CRI / Papel"])
    assertEquals(androidx.compose.ui.graphics.Color(0xFF10B981), colors["CRA / Fiagro"])
  }

  @Test
  fun `set all assets selection test`() = kotlinx.coroutines.runBlocking {
    val context = androidx.test.core.app.ApplicationProvider.getApplicationContext<android.content.Context>()
    val db = androidx.room.Room.inMemoryDatabaseBuilder(context, com.example.data.local.AppDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    val dao = db.fiiDao()
    dao.insertAssets(DefaultData.defaultAssets)

    // Desativa todos
    dao.setAllAssetsSelection(false)
    val afterDeactivate = dao.getAllAssetsSync()
    assertTrue(afterDeactivate.all { !it.isSelected })

    // Ativa todos
    dao.setAllAssetsSelection(true)
    val afterActivate = dao.getAllAssetsSync()
    assertTrue(afterActivate.all { it.isSelected })

    db.close()
  }

  @Test
  fun `travar valor and distribution logic test`() = kotlinx.coroutines.runBlocking {
    val context = androidx.test.core.app.ApplicationProvider.getApplicationContext<android.content.Context>()
    val db = androidx.room.Room.inMemoryDatabaseBuilder(context, com.example.data.local.AppDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    val dao = db.fiiDao()

    val asset1 = FiiAssetEntity(
        ticker = "KNCR11",
        name = "Kinea Rendimentos",
        category = "CRI / Papel",
        segmentType = "Papel",
        currentPrice = 100.0,
        lastDividend = 1.0,
        shares = 100, // Valor total: 10.000
        targetPercentage = 50.0,
        isSelected = true,
        isLocked = true, // TRAVADO
        isPriceUpdated = true
    )

    val asset2 = FiiAssetEntity(
        ticker = "RZAG11",
        name = "Rizea Ágora",
        category = "CRA / Fiagro",
        segmentType = "Fiagro",
        currentPrice = 10.0,
        lastDividend = 0.12,
        shares = 0, // DESTRAVADO (vai receber aporte)
        targetPercentage = 25.0,
        isSelected = true,
        isLocked = false,
        isPriceUpdated = true
    )

    val asset3 = FiiAssetEntity(
        ticker = "GARE11",
        name = "Guardian Real Estate",
        category = "Logística / Tijolo",
        segmentType = "Tijolo",
        currentPrice = 20.0,
        lastDividend = 0.18,
        shares = 0, // DESTRAVADO (vai receber aporte)
        targetPercentage = 25.0,
        isSelected = true,
        isLocked = false,
        isPriceUpdated = true
    )

    dao.insertAssets(listOf(asset1, asset2, asset3))

    // Simula cálculo de distribuição com Capital Total = 30.000
    val totalCapital = 30000.0
    val allActive = dao.getAllAssetsSync().filter { it.isSelected }
    val lockedAssets = allActive.filter { it.isLocked }
    val unlockedAssets = allActive.filter { !it.isLocked }

    assertEquals(1, lockedAssets.size)
    assertEquals(2, unlockedAssets.size)

    val lockedTotal = lockedAssets.sumOf { it.shares * it.currentPrice }
    assertEquals(10000.0, lockedTotal, 0.01)

    val remainingToDistribute = totalCapital - lockedTotal
    assertEquals(20000.0, remainingToDistribute, 0.01)

    val amountPerUnlocked = remainingToDistribute / unlockedAssets.size
    assertEquals(10000.0, amountPerUnlocked, 0.01)

    // Recalcula cotas dos destravados
    for (unlocked in unlockedAssets) {
        val newShares = (amountPerUnlocked / unlocked.currentPrice).toInt()
        dao.updateAsset(unlocked.copy(shares = newShares))
    }

    val updatedAssets = dao.getAllAssetsSync().associateBy { it.ticker }
    // KNCR11 mantido travado em 100 cotas
    assertEquals(100, updatedAssets["KNCR11"]?.shares)
    // RZAG11 (preço 10.0): 10.000 / 10.0 = 1000 cotas
    assertEquals(1000, updatedAssets["RZAG11"]?.shares)
    // GARE11 (preço 20.0): 10.000 / 20.0 = 500 cotas
    assertEquals(500, updatedAssets["GARE11"]?.shares)

    db.close()
  }
}

