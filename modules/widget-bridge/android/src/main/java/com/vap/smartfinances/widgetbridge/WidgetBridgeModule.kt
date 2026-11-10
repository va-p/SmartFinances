package com.vap.smartfinances.widgetbridge

import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Shared state with the widgets. The extension providers never hit the
// network: they only read this snapshot. `reloadTimelines` broadcasts the
// update action that every T9 provider observes.
private const val PREFS_NAME = "widget_snapshot"
private const val SNAPSHOT_KEY = "snapshot"

class WidgetBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetBridge")

    Function("setSnapshot") { json: String ->
      appContext.reactContext
        ?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        ?.edit()
        ?.putString(SNAPSHOT_KEY, json)
        ?.apply()
    }

    Function("clearSnapshot") {
      appContext.reactContext
        ?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        ?.edit()
        ?.remove(SNAPSHOT_KEY)
        ?.apply()
    }

    Function("reloadTimelines") {
      val context = appContext.reactContext ?: return@Function
      context.sendBroadcast(
        Intent("com.vap.smartfinances.WIDGET_SNAPSHOT_UPDATED").setPackage(
          context.packageName
        )
      )
    }
  }
}
