package com.vap.smartfinances.widgets

import org.json.JSONObject

// Mirrors `src/widgets/widgetSnapshotTypes.ts`. All money math happens in
// TypeScript; widgets only render these pre-formatted strings.
data class WidgetBudgetRow(
  val id: String,
  val name: String,
  val percent: Double,
  val percentLabel: String,
  val statusText: String,
  val over: Boolean
)

data class WidgetCashFlowBar(val income: Double, val expense: Double)

data class WidgetCashFlow(
  val monthLabel: String,
  val income: String,
  val expenses: String,
  val bars: List<WidgetCashFlowBar>
)

data class WidgetTopCritical(val name: String, val percent: String)

data class WidgetOverview(
  val total: String,
  val alertName: String?,
  val alertPercent: String?,
  val alertOver: Boolean,
  val criticalName: String?,
  val criticalPercent: String?,
  val topCritical: List<WidgetTopCritical>
)

data class WidgetDonutSlice(val categoryId: String, val value: Double, val label: String)

data class WidgetNetWorth(val total: String, val spark: List<Double>, val donut: List<WidgetDonutSlice>)

data class WidgetInstitutionRow(val id: String, val name: String, val accountCount: Int, val balance: String)

data class WidgetSnapshot(
  val version: Int,
  val signedIn: Boolean,
  val hidden: Boolean,
  val budgets: List<WidgetBudgetRow>,
  val cashFlow: WidgetCashFlow,
  val overview: WidgetOverview,
  val netWorth: WidgetNetWorth,
  val institutions: List<WidgetInstitutionRow>
)

fun optNullableString(json: JSONObject, key: String): String? {
  if (json.isNull(key)) return null
  return json.optString(key).ifEmpty { null }
}

fun parseBudgetRow(json: JSONObject) = WidgetBudgetRow(
  id = json.optString("id"),
  name = json.optString("name"),
  percent = json.optDouble("percent"),
  percentLabel = json.optString("percentLabel"),
  statusText = json.optString("statusText"),
  over = json.optBoolean("over")
)

fun parseSnapshot(raw: String): WidgetSnapshot? {
  return try {
    val json = JSONObject(raw)
    val cashFlowJson = json.optJSONObject("cashFlow") ?: JSONObject()
    val overviewJson = json.optJSONObject("overview") ?: JSONObject()
    val netWorthJson = json.optJSONObject("netWorth") ?: JSONObject()

    val bars = mutableListOf<WidgetCashFlowBar>()
    val barsJson = cashFlowJson.optJSONArray("bars")
    if (barsJson != null) {
      for (i in 0 until barsJson.length()) {
        val bar = barsJson.optJSONObject(i) ?: continue
        bars.add(WidgetCashFlowBar(bar.optDouble("income"), bar.optDouble("expense")))
      }
    }

    val budgets = mutableListOf<WidgetBudgetRow>()
    val budgetsJson = json.optJSONArray("budgets")
    if (budgetsJson != null) {
      for (i in 0 until budgetsJson.length()) {
        budgets.add(parseBudgetRow(budgetsJson.optJSONObject(i) ?: continue))
      }
    }

    val donut = mutableListOf<WidgetDonutSlice>()
    val donutJson = netWorthJson.optJSONArray("donut")
    if (donutJson != null) {
      for (i in 0 until donutJson.length()) {
        val slice = donutJson.optJSONObject(i) ?: continue
        donut.add(WidgetDonutSlice(slice.optString("categoryId"), slice.optDouble("value"), slice.optString("label")))
      }
    }

    val spark = mutableListOf<Double>()
    val sparkJson = netWorthJson.optJSONArray("spark")
    if (sparkJson != null) {
      for (i in 0 until sparkJson.length()) {
        spark.add(sparkJson.optDouble(i))
      }
    }

    val institutions = mutableListOf<WidgetInstitutionRow>()
    val institutionsJson = json.optJSONArray("institutions")
    if (institutionsJson != null) {
      for (i in 0 until institutionsJson.length()) {
        val row = institutionsJson.optJSONObject(i) ?: continue
        institutions.add(
          WidgetInstitutionRow(
            row.optString("id"),
            row.optString("name"),
            row.optInt("accountCount"),
            row.optString("balance")
          )
        )
      }
    }

    WidgetSnapshot(
      version = json.optInt("version", 1),
      signedIn = json.optBoolean("signedIn"),
      hidden = json.optBoolean("hidden"),
      budgets = budgets,
      cashFlow = WidgetCashFlow(
        cashFlowJson.optString("monthLabel"),
        cashFlowJson.optString("income"),
        cashFlowJson.optString("expenses"),
        bars
      ),
      val topCritical = mutableListOf<WidgetTopCritical>()
      val topCriticalJson = overviewJson.optJSONArray("topCritical")
      if (topCriticalJson != null) {
        for (i in 0 until topCriticalJson.length()) {
          val item = topCriticalJson.optJSONObject(i) ?: continue
          topCritical.add(WidgetTopCritical(item.optString("name"), item.optString("percent")))
        }
      }
      overview = WidgetOverview(
        overviewJson.optString("total"),
        optNullableString(overviewJson, "alertName"),
        optNullableString(overviewJson, "alertPercent"),
        overviewJson.optBoolean("alertOver"),
        optNullableString(overviewJson, "criticalName"),
        optNullableString(overviewJson, "criticalPercent"),
        topCritical
      ),
      netWorth = WidgetNetWorth(netWorthJson.optString("total"), spark, donut),
      institutions = institutions
    )
  } catch (_: Exception) {
    // Corrupt snapshot: callers render the setup placeholder (WDG-39).
    null
  }
}
