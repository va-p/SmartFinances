package com.vap.smartfinances.widgets

import android.content.Context
import android.view.View
import android.widget.RemoteViews

import com.vap.smartfinances.R

// Fixed slots per size; each slot carries a green and a red bar and shows
// exactly one (RemoteViews cannot tint a ProgressBar per row). Short lists
// collapse (GONE); extras never render (no scroll inside widgets).
private data class BudgetSlot(
  val row: Int,
  val name: Int,
  val percent: Int,
  val barGreen: Int,
  val barRed: Int,
  val status: Int
)

private val MEDIUM_SLOTS = listOf(
  BudgetSlot(R.id.budget_row_0, R.id.budget_name_0, R.id.budget_percent_0, R.id.budget_bar_green_0, R.id.budget_bar_red_0, R.id.budget_status_0),
  BudgetSlot(R.id.budget_row_1, R.id.budget_name_1, R.id.budget_percent_1, R.id.budget_bar_green_1, R.id.budget_bar_red_1, R.id.budget_status_1),
  BudgetSlot(R.id.budget_row_2, R.id.budget_name_2, R.id.budget_percent_2, R.id.budget_bar_green_2, R.id.budget_bar_red_2, R.id.budget_status_2)
)

private val LARGE_SLOTS = MEDIUM_SLOTS + listOf(
  BudgetSlot(R.id.budget_row_3, R.id.budget_name_3, R.id.budget_percent_3, R.id.budget_bar_green_3, R.id.budget_bar_red_3, R.id.budget_status_3),
  BudgetSlot(R.id.budget_row_4, R.id.budget_name_4, R.id.budget_percent_4, R.id.budget_bar_green_4, R.id.budget_bar_red_4, R.id.budget_status_4),
  BudgetSlot(R.id.budget_row_5, R.id.budget_name_5, R.id.budget_percent_5, R.id.budget_bar_green_5, R.id.budget_bar_red_5, R.id.budget_status_5)
)

private fun budgetsViews(
  context: Context,
  snapshot: WidgetSnapshot,
  slots: List<BudgetSlot>,
  layout: Int
): RemoteViews {
  val rows = snapshot.budgets.take(slots.size)
  return RemoteViews(context.packageName, layout).apply {
    setTextViewText(R.id.budgets_title, "Orçamentos")
    setOnClickPendingIntent(
      R.id.budgets_header,
      BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.URL_BUDGETS)
    )
    slots.forEachIndexed { index, slot ->
      val row = rows.getOrNull(index)
      if (row == null) {
        setViewVisibility(slot.row, View.GONE)
      } else {
        setViewVisibility(slot.row, View.VISIBLE)
        setTextViewText(slot.name, row.name)
        setTextViewText(slot.percent, row.percentLabel)
        setTextViewText(slot.status, row.statusText)
        val progress = row.percent.toInt().coerceIn(0, 100)
        if (row.over) {
          setViewVisibility(slot.barGreen, View.GONE)
          setViewVisibility(slot.barRed, View.VISIBLE)
          setProgressBar(slot.barRed, 100, progress, false)
        } else {
          setViewVisibility(slot.barRed, View.GONE)
          setViewVisibility(slot.barGreen, View.VISIBLE)
          setProgressBar(slot.barGreen, 100, progress, false)
        }
        setOnClickPendingIntent(
          slot.row,
          BaseWidgetProvider.deepLinkIntent(context, BaseWidgetProvider.budgetDetailUrl(row.id))
        )
      }
    }
  }
}

class BudgetsMediumWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return budgetsViews(context, snapshot, MEDIUM_SLOTS, R.layout.widget_budgets_medium)
  }
}

class BudgetsLargeWidgetProvider : BaseWidgetProvider() {
  override fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews {
    return budgetsViews(context, snapshot, LARGE_SLOTS, R.layout.widget_budgets_large)
  }
}
