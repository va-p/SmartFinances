package com.vap.smartfinances.widgets

import android.content.Context
import android.view.View
import android.widget.RemoteViews

import com.vap.smartfinances.R

private fun criticalCard(views: RemoteViews, snapshot: WidgetSnapshot, totalId: Int) {
  val overview = snapshot.overview
  views.setTextViewText(totalId, overview.total)
  val name = overview.criticalName
  val percent = overview.criticalPercent
  if (name == null || percent == null) {
    views.setViewVisibility(R.id.control_critical, View.GONE)
  } else {
    views.setViewVisibility(R.id.control_critical, View.VISIBLE)
    views.setTextViewText(R.id.control_critical_name, name)
    views.setTextViewText(R.id.control_critical_percent, "$percent utilizado")
    val progress = percent.replace("%", "").replace(",", ".").toDoubleOrNull()?.toInt()?.coerceIn(0, 100) ?: 0
    views.setProgressBar(R.id.control_critical_bar, 100, progress, false)
  }
}

class ControlMediumWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return RemoteViews(context.packageName, R.layout.widget_control_medium).apply {
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

class ControlLargeWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    val netWorth = snapshot.netWorth
    return RemoteViews(context.packageName, R.layout.widget_control_large).apply {
      criticalCard(this, snapshot, R.id.control_total)
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
