package com.vap.smartfinances.widgets

import android.content.Context
import android.widget.RemoteViews

import com.vap.smartfinances.R

private fun cashFlowHeader(views: RemoteViews, cashFlow: WidgetCashFlow) {
  views.setTextViewText(R.id.cashflow_month, cashFlow.monthLabel)
  views.setTextViewText(R.id.cashflow_income, cashFlow.income)
  views.setTextViewText(R.id.cashflow_expenses, cashFlow.expenses)
}

class CashflowSmallWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    val cashFlow = snapshot.cashFlow
    return RemoteViews(context.packageName, R.layout.widget_cashflow_small).apply {
      cashFlowHeader(this, cashFlow)
      setImageViewBitmap(
        R.id.cashflow_mini_chart,
        WidgetCharts.drawMiniBars(cashFlow.bars, BaseWidgetProvider.dp(context, 120), BaseWidgetProvider.dp(context, 48))
      )
      setOnClickPendingIntent(
        R.id.cashflow_add,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ADD_TRANSACTION)
      )
    }
  }
}

class CashflowMediumWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    val cashFlow = snapshot.cashFlow
    return RemoteViews(context.packageName, R.layout.widget_cashflow_medium).apply {
      cashFlowHeader(this, cashFlow)
      // Android Medium uses horizontal bars (spec orientation); iOS uses vertical.
      setImageViewBitmap(
        R.id.cashflow_bars,
        WidgetCharts.drawHorizontalBars(
          cashFlow.bars,
          BaseWidgetProvider.dp(context, 180),
          BaseWidgetProvider.dp(context, 8),
          BaseWidgetProvider.dp(context, 6)
        )
      )
      setOnClickPendingIntent(
        R.id.cashflow_add,
        BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_ADD_TRANSACTION)
      )
    }
  }
}
