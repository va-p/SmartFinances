package com.vap.smartfinances.widgets

import android.content.Context
import android.view.View
import android.widget.RemoteViews

import com.vap.smartfinances.R

private fun patrimonyViews(
  context: Context,
  snapshot: WidgetSnapshot,
  layout: Int,
  withSpark: Boolean
): RemoteViews {
  return RemoteViews(context.packageName, layout).apply {
    setTextViewText(R.id.patrimony_total, snapshot.netWorth.total)
    setOnClickPendingIntent(
      R.id.patrimony_header,
      BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ACCOUNTS)
    )
    if (!withSpark) {
      setOnClickPendingIntent(
        R.id.patrimony_eye,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_HIDE_DATA)
      )
    }
    if (withSpark) {
      setImageViewBitmap(
        R.id.patrimony_spark,
        WidgetCharts.drawSparkline(
          snapshot.netWorth.spark,
          BaseWidgetProvider.dp(context, 140),
          BaseWidgetProvider.dp(context, 64)
        )
      )
    }
    val rows = snapshot.institutions.take(2)
    if (rows.isEmpty()) {
      setViewVisibility(R.id.patrimony_row_0, View.GONE)
      setViewVisibility(R.id.patrimony_row_1, View.GONE)
      setViewVisibility(R.id.patrimony_empty, View.VISIBLE)
    } else {
      setViewVisibility(R.id.patrimony_empty, View.GONE)
      rows.forEachIndexed { index, row ->
        val rowId = if (index == 0) R.id.patrimony_row_0 else R.id.patrimony_row_1
        val nameId = if (index == 0) R.id.patrimony_name_0 else R.id.patrimony_name_1
        val countId = if (index == 0) R.id.patrimony_count_0 else R.id.patrimony_count_1
        val balanceId = if (index == 0) R.id.patrimony_balance_0 else R.id.patrimony_balance_1
        setViewVisibility(rowId, View.VISIBLE)
        setTextViewText(nameId, row.name)
        setTextViewText(countId, "${row.accountCount} contas")
        setTextViewText(balanceId, row.balance)
        setOnClickPendingIntent(
          rowId,
          BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ACCOUNTS)
        )
      }
      if (rows.size < 2) {
        setViewVisibility(R.id.patrimony_row_1, View.GONE)
      }
    }
  }
}

class PatrimonySmallWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return patrimonyViews(context, snapshot, R.layout.widget_patrimony_small, false)
  }
}

class PatrimonyMediumWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return patrimonyViews(context, snapshot, R.layout.widget_patrimony_medium, true)
  }
}
