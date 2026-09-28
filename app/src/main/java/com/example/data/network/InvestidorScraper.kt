package com.example.data.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

/**
 * Resultado tipado e modular de consulta de cotação no mercado
 */
data class ScrapedMarketData(
    val ticker: String,
    val price: Double?,
    val lastDividend: Double?,
    val dy12m: Double?,
    val name: String?,
    val source: String = "B3",
    val success: Boolean = true,
    val errorMessage: String? = null
)

class InvestidorScraper {
    private val client = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    private val browserUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

    /**
     * Consulta cotação atualizada consultando em ordem estrita de failover:
     * 1. B3 / Yahoo Finance API (tempo real, cotações oficiais da bolsa brasileira .SA)
     * 2. Investidor10 (cotações, dividendos e yield)
     * 3. Status Invest (fonte alternativa para FIIs e Fiagros)
     *
     * Inclui cabeçalhos anti-CORS/anti-bloqueio, timeouts configurados e tratamento de erros tipado.
     */
    suspend fun fetchMarketData(tickerInput: String): ScrapedMarketData = withContext(Dispatchers.IO) {
        val cleanTicker = tickerInput.trim().uppercase()

        // Fonte 1: B3 via endpoint oficial de mercado (rápido, sem bloqueio de scraping HTML)
        val b3Result = fetchFromB3Yahoo(cleanTicker)
        if (b3Result != null && b3Result.price != null && b3Result.price > 0) {
            // Tenta complementar dividendos via Investidor10 de forma não-bloqueante
            val dividendData = fetchDividendsFromInvestidor10(cleanTicker)
            return@withContext b3Result.copy(
                lastDividend = dividendData?.lastDividend ?: b3Result.lastDividend,
                dy12m = dividendData?.dy12m ?: b3Result.dy12m,
                source = "B3"
            )
        }

        // Fonte 2: Investidor10
        val investidor10Result = fetchFromInvestidor10(cleanTicker)
        if (investidor10Result != null && investidor10Result.price != null && investidor10Result.price > 0) {
            return@withContext investidor10Result
        }

        // Fonte 3: Status Invest
        val statusInvestResult = fetchFromStatusInvest(cleanTicker)
        if (statusInvestResult != null && statusInvestResult.price != null && statusInvestResult.price > 0) {
            return@withContext statusInvestResult
        }

        ScrapedMarketData(
            ticker = cleanTicker,
            price = null,
            lastDividend = null,
            dy12m = null,
            name = null,
            source = "Nenhuma",
            success = false,
            errorMessage = "Não foi possível obter cotação para $cleanTicker nas fontes B3, Investidor10 ou StatusInvest."
        )
    }

    /**
     * Consulta cotação da B3 via JSON API Yahoo Finance Brasil (.SA)
     */
    private fun fetchFromB3Yahoo(ticker: String): ScrapedMarketData? {
        try {
            val url = "https://query1.finance.yahoo.com/v8/finance/chart/$ticker.SA"
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", browserUserAgent)
                .header("Accept", "application/json")
                .header("Origin", "https://finance.yahoo.com")
                .header("Referer", "https://finance.yahoo.com/")
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val body = response.body?.string().orEmpty()
                    if (body.isNotBlank()) {
                        val json = JSONObject(body)
                        val chart = json.optJSONObject("chart") ?: return null
                        val resultArray = chart.optJSONArray("result") ?: return null
                        if (resultArray.length() > 0) {
                            val firstResult = resultArray.getJSONObject(0)
                            val meta = firstResult.optJSONObject("meta") ?: return null
                            val price = meta.optDouble("regularMarketPrice", 0.0).let {
                                if (it > 0) it else meta.optDouble("chartPreviousClose", 0.0)
                            }
                            val name = meta.optString("shortName", ticker)

                            if (price > 0) {
                                return ScrapedMarketData(
                                    ticker = ticker,
                                    price = price,
                                    lastDividend = null,
                                    dy12m = null,
                                    name = name,
                                    source = "B3",
                                    success = true
                                )
                            }
                        }
                    }
                }
            }
        } catch (_: Exception) {
            // Falha graciosa para fallback
        }
        return null
    }

    /**
     * Consulta Investidor10 para obter preço e dividendos
     */
    private fun fetchFromInvestidor10(ticker: String): ScrapedMarketData? {
        val lowerTicker = ticker.lowercase()
        val paths = listOf("fiis", "fiagros", "etfs", "acoes")
        for (path in paths) {
            try {
                val url = "https://investidor10.com.br/$path/$lowerTicker/"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", browserUserAgent)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8")
                    .header("Referer", "https://investidor10.com.br/")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string().orEmpty()
                        if (body.contains("Cotação", ignoreCase = true) || body.contains("Valor atual", ignoreCase = true)) {
                            val parsed = parseInvestidor10Html(ticker, body)
                            if (parsed.price != null && parsed.price > 0) {
                                return parsed.copy(source = "Investidor10")
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // Continua para próximo path
            }
        }
        return null
    }

    /**
     * Consulta dividendos específicos no Investidor10
     */
    private fun fetchDividendsFromInvestidor10(ticker: String): ScrapedMarketData? {
        val lowerTicker = ticker.lowercase()
        val paths = listOf("fiis", "fiagros")
        for (path in paths) {
            try {
                val url = "https://investidor10.com.br/$path/$lowerTicker/"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", browserUserAgent)
                    .header("Accept", "text/html,application/xhtml+xml")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string().orEmpty()
                        val parsed = parseInvestidor10Html(ticker, body)
                        if (parsed.lastDividend != null && parsed.lastDividend > 0) {
                            return parsed
                        }
                    }
                }
            } catch (_: Exception) {
                // Ignora falhas de dividendos
            }
        }
        return null
    }

    /**
     * Consulta cotação via Status Invest como fallback
     */
    private fun fetchFromStatusInvest(ticker: String): ScrapedMarketData? {
        val lowerTicker = ticker.lowercase()
        val categories = listOf("fundos-imobiliarios", "fiagros", "etfs")
        for (cat in categories) {
            try {
                val url = "https://statusinvest.com.br/$cat/$lowerTicker"
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", browserUserAgent)
                    .header("Accept", "text/html,application/xhtml+xml")
                    .header("Referer", "https://statusinvest.com.br/")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string().orEmpty()
                        val priceMatcher = Pattern.compile(
                            """class="[^"]*value[^"]*"[^>]*>[\s\r\n]*([0-9]+,[0-9]{2})[\s\r\n]*<""",
                            Pattern.CASE_INSENSITIVE
                        ).matcher(body)

                        if (priceMatcher.find()) {
                            val price = parseDoublePtBr(priceMatcher.group(1))
                            if (price != null && price > 0) {
                                return ScrapedMarketData(
                                    ticker = ticker,
                                    price = price,
                                    lastDividend = null,
                                    dy12m = null,
                                    name = null,
                                    source = "Status Invest",
                                    success = true
                                )
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // Continua para próxima tentativa
            }
        }
        return null
    }

    private fun parseInvestidor10Html(ticker: String, html: String): ScrapedMarketData {
        // Price regex
        var price: Double? = null
        val priceMatcher = Pattern.compile(
            """class="[^"]*cotacao[^"]*".*?<span class="value"[^>]*>[\s\r\n]*R?\$?\s*([0-9.,]+)""",
            Pattern.DOTALL or Pattern.CASE_INSENSITIVE
        ).matcher(html)
        if (priceMatcher.find()) {
            price = parseDoublePtBr(priceMatcher.group(1))
        }

        // DY regex
        var dy12m: Double? = null
        val dyMatcher = Pattern.compile(
            """class="[^"]*dy[^"]*".*?<span>\s*([0-9.,]+)%\s*</span>""",
            Pattern.DOTALL or Pattern.CASE_INSENSITIVE
        ).matcher(html)
        if (dyMatcher.find()) {
            dy12m = parseDoublePtBr(dyMatcher.group(1))
        }

        // Last dividend
        var lastDividend: Double? = null
        val divMatcher = Pattern.compile(
            """table-dividends-history.*?<tbody>\s*<tr[^>]*>.*?<td[^>]*>.*?</td>.*?<td[^>]*>.*?</td>.*?<td[^>]*>.*?</td>\s*<td[^>]*>\s*([0-9.,]+)""",
            Pattern.DOTALL or Pattern.CASE_INSENSITIVE
        ).matcher(html)
        if (divMatcher.find()) {
            lastDividend = parseDoublePtBr(divMatcher.group(1))
        }

        // Fund name
        var name: String? = null
        val nameMatcher = Pattern.compile(
            """id="sub-header-company-name"[^>]*>([\s\S]*?)</h2>""",
            Pattern.CASE_INSENSITIVE
        ).matcher(html)
        if (nameMatcher.find()) {
            name = nameMatcher.group(1).trim()
        }

        return ScrapedMarketData(
            ticker = ticker,
            price = price,
            lastDividend = lastDividend,
            dy12m = dy12m,
            name = name,
            source = "Investidor10",
            success = price != null
        )
    }

    private fun parseDoublePtBr(str: String?): Double? {
        if (str.isNullOrBlank()) return null
        return try {
            val cleaned = str.trim().replace(".", "").replace(",", ".")
            cleaned.toDoubleOrNull()
        } catch (_: Exception) {
            null
        }
    }
}
