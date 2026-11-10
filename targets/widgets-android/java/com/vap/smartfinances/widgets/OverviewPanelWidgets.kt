package com.vap.smartfinances.widgets

import android.content.Context
import android.view.View
import android.widget.RemoteViews

import com.vap.smartfinances.R

private fun bindCriticalCard(
  views: RemoteViews,
  cardId: Int,
  nameId: Int,
  barId: Int,
  percentId: Int,
  name: String?,
  percent: String?
) {
  if (name == null || percent == null) {
    views.setViewVisibility(cardId, View.GONE)
  } else {
    views.setViewVisibility(cardId, View.VISIBLE)
    views.setTextViewText(nameId, name)
    views.setTextViewText(percentId, "$percent utilizado")
    val progress = percent.replace("%", "").replace(",", ".").toDoubleOrNull()?.toInt()?.coerceIn(0, 100) ?: 0
    views.setProgressBar(barId, 100, progress, false)
  }
}

private fun criticalCard(views: RemoteViews, snapshot: WidgetSnapshot, totalId: Int) {
  val overview = snapshot.overview
  views.setTextViewText(totalId, overview.total)
  bindCriticalCard(
    views,
    R.id.control_critical,
    R.id.control_critical_name,
    R.id.control_critical_bar,
    R.id.control_critical_percent,
    overview.criticalName,
    overview.criticalPercent
  )
}

// WDG-51: Large lists the two worst budgets; falls back to the legacy single
// critical fields when topCritical is empty (older snapshots).
private fun criticalCardsLarge(views: RemoteViews, snapshot: WidgetSnapshot) {
  val overview = snapshot.overview
  views.setTextViewText(R.id.control_total, overview.total)
  val top = overview.topCritical.take(2)
  val first = top.getOrNull(0)
  val second = top.getOrNull(1)
  bindCriticalCard(
    views,
    R.id.control_critical,
    R.id.control_critical_name,
    R.id.control_critical_bar,
    R.id.control_critical_percent,
    first?.name ?: overview.criticalName,
    first?.percent ?: overview.criticalPercent
  )
  bindCriticalCard(
    views,
    R.id.control_critical_second,
    R.id.control_critical_name_second,
    R.id.control_critical_bar_second,
    R.id.control_critical_percent_second,
    second?.name,
    second?.percent
  )
}

class OverviewMediumWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return RemoteViews(context.packageName, R.layout.widget_overview_medium).apply {
      criticalCard(this, snapshot, R.id.control_total)
      setOnClickPendingIntent(
        R.id.control_add,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ADD_TRANSACTION)
      )
      setOnClickPendingIntent(
        R.id.control_reports,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_OVERVIEW)
      )
    }
  }
}

class OverviewLargeWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    val netWorth = snapshot.netWorth
    return RemoteViews(context.packageName, R.layout.widget_overview_large).apply {
      criticalCardsLarge(this, snapshot)
      setImageViewBitmap(
        R.id.control_spark,
        WidgetCharts.drawSparkline(netWorth.spark, BaseWidgetProvider.dp(context, 140), BaseWidgetProvider.dp(context, 64))
      )
      setImageViewBitmap(
        R.id.control_donut,
        WidgetCharts.drawDonut(netWorth.donut, BaseWidgetProvider.dp(context, 120))
      )
      val legend = netWorth.donut.take(2)
      if (legend.isEmpty()) {
        setViewVisibility(R.id.control_legend, View.GONE)
      } else {
        setViewVisibility(R.id.control_legend, View.VISIBLE)
        setTextViewText(R.id.control_legend_0, legend.getOrNull(0)?.let { "● ${it.label}" } ?: "")
        setTextViewText(R.id.control_legend_1, legend.getOrNull(1)?.let { "● ${it.label}" } ?: "")
      }
      setOnClickPendingIntent(
        R.id.control_add,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ADD_TRANSACTION)
      )
      setOnClickPendingIntent(
        R.id.control_reports,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_OVERVIEW)
      )
    }
  }
}
