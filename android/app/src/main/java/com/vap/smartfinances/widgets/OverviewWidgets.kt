package com.vap.smartfinances.widgets

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.RemoteViews

import com.vap.smartfinances.R

// Overview Small variant storage: widget-system configuration (one choice per
// widget instance, default Variant A card). Selected in the configure activity.
internal fun overviewVariant(context: Context, widgetId: Int): String {
  return context
    .getSharedPreferences(BaseWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
    .getString("overview_variant_$widgetId", "card") ?: "card"
}

private fun overviewViews(
  context: Context,
  widgetId: Int,
  snapshot: WidgetSnapshot
): RemoteViews {
  val overview = snapshot.overview
  val useCard = overviewVariant(context, widgetId) != "bar"
  val layout = if (useCard) R.layout.widget_overview_small_a else R.layout.widget_overview_small_b
  return RemoteViews(context.packageName, layout).apply {
    setTextViewText(R.id.overview_total, overview.total)
    setOnClickPendingIntent(
      R.id.overview_header,
      BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_OVERVIEW)
    )
    setOnClickPendingIntent(
      R.id.overview_eye,
      BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_HIDE_DATA)
    )
    val name = overview.alertName
    val percent = overview.alertPercent
    if (name == null || percent == null) {
      setViewVisibility(R.id.overview_alert, View.GONE)
    } else {
      setViewVisibility(R.id.overview_alert, View.VISIBLE)
      setTextViewText(R.id.overview_alert_name, "Alerta: $name")
      setTextViewText(R.id.overview_alert_percent, percent)
      if (!useCard) {
        val progress = percent.replace("%", "").replace(",", ".").toDoubleOrNull()?.toInt()?.coerceIn(0, 100) ?: 0
        setProgressBar(R.id.overview_alert_bar, 100, progress, false)
      }
    }
  }
}

class OverviewSmallWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return overviewViews(context, widgetId, snapshot)
  }
}

class OverviewSmallConfigureActivity : Activity() {
  private var widgetId = AppWidgetManager.INVALID_APPWIDGET_ID

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    widgetId = intent?.extras?.getInt(
      AppWidgetManager.EXTRA_APPWIDGET_ID,
      AppWidgetManager.INVALID_APPWIDGET_ID
    ) ?: AppWidgetManager.INVALID_APPWIDGET_ID
    setResult(RESULT_CANCELED)
    if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
      finish()
      return
    }

    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(48, 48, 48, 48)
    }
    val cardButton = Button(this).apply { text = "Cartão de alerta (Variante A)" }
    val barButton = Button(this).apply { text = "Barra simples (Variante B)" }
    cardButton.setOnClickListener { saveVariant("card") }
    barButton.setOnClickListener { saveVariant("bar") }
    layout.addView(cardButton)
    layout.addView(barButton)
    setContentView(layout)
  }

  private fun saveVariant(variant: String) {
    getSharedPreferences(BaseWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString("overview_variant_$widgetId", variant)
      .apply()
    val manager = AppWidgetManager.getInstance(this)
    OverviewSmallWidgetProvider().updateWidget(this, manager, widgetId)
    val result = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
    setResult(RESULT_OK, result)
    finish()
  }
}
