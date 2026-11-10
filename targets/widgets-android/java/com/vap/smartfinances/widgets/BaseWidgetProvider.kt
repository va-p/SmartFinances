package com.vap.smartfinances.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.TypedValue
import android.widget.RemoteViews

import com.vap.smartfinances.R

// Shared plumbing for all 9 providers: snapshot load, signed-out/locked view,
// deep-link intents. Must stay in sync with `modules/widget-bridge` prefs.
abstract class BaseWidgetProvider : AppWidgetProvider() {
  companion object {
    const val PREFS_NAME = "widget_snapshot"
    const val SNAPSHOT_KEY = "snapshot"
    const val UPDATE_ACTION = "com.vap.smartfinances.WIDGET_SNAPSHOT_UPDATED"

    const val URL_BUDGETS = "com.vap.smartfinances://budgets"
    const val URL_ADD_TRANSACTION = "com.vap.smartfinances://transactions/new"
    const val URL_OVERVIEW = "com.vap.smartfinances://overview"
    const val URL_ACCOUNTS = "com.vap.smartfinances://accounts"

    fun budgetDetailUrl(id: String) = "com.vap.smartfinances://budgets/$id"

    fun dp(context: Context, dp: Int): Int {
      return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        dp.toFloat(),
        context.resources.displayMetrics
      ).toInt()
    }

    fun deepLinkIntent(context: Context, url: String): PendingIntent {
      val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
        setPackage(context.packageName)
      }
      val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      return PendingIntent.getActivity(context, url.hashCode(), intent, flags)
    }
  }

  protected abstract fun viewsFor(context: Context, widgetId: Int, snapshot: WidgetSnapshot): RemoteViews

  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    ids.forEach { updateWidget(context, manager, it) }
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action == UPDATE_ACTION) {
      val manager = AppWidgetManager.getInstance(context)
      val component = android.content.ComponentName(context, this::class.java)
      onUpdate(context, manager, manager.getAppWidgetIds(component))
    }
  }

  fun updateWidget(context: Context, manager: AppWidgetManager, widgetId: Int) {
    val raw = context
      .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SNAPSHOT_KEY, null)
    val snapshot = raw?.let { parseSnapshot(it) }
    val views = if (snapshot == null || !snapshot.signedIn) {
      lockedViews(context)
    } else {
      viewsFor(context, widgetId, snapshot)
    }
    manager.updateAppWidget(widgetId, views)
  }

  private fun lockedViews(context: Context): RemoteViews {
    return RemoteViews(context.packageName, R.layout.widget_locked).apply {
      setOnClickPendingIntent(R.id.locked_root, deepLinkIntent(context, URL_BUDGETS))
    }
  }
}
