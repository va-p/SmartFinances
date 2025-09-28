package com.vap.smartfinances

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.material.snackbar.Snackbar
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability

class InAppUpdateModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val appUpdateManager: AppUpdateManager
    private var appUpdateInfo: AppUpdateInfo? = null

    companion object {
        private const val REQUEST_CODE = 501
        private const val IMMEDIATE_UPDATE_PRIORITY_THRESHOLD =
                0 // All priorities (0 - 5) will be immediate
    }

    private val installStateUpdatedListener = InstallStateUpdatedListener { state ->
        if (state.installStatus() == InstallStatus.DOWNLOADED) {
            popupSnackbarForCompleteUpdate()
        }
    }

    init {
        appUpdateManager = AppUpdateManagerFactory.create(reactContext)
        reactContext.addActivityEventListener(this)
        appUpdateManager.registerListener(installStateUpdatedListener)
    }

    override fun getName() = "InAppUpdate"

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        appUpdateManager.unregisterListener(installStateUpdatedListener)
    }

    // Adds onResume to handling the immediate update flow when the app returns from the
    // background
    @ReactMethod
    fun onResume() {
        appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.updateAvailability() ==
                            UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
            ) {
                // If an update is already in progress, restart the flow.
                startUpdate(info, AppUpdateType.IMMEDIATE, null)
            }
        }
    }

    @ReactMethod
    fun checkForUpdates(promise: Promise) {
        appUpdateManager.appUpdateInfo
                .addOnSuccessListener { info ->
                    this.appUpdateInfo = info // Save updates info

                    val updatePriority = info.updatePriority()
                    val isUpdateAvailable =
                            info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE

                    // Logic to decide between Immediate and Flexible
                    if (isUpdateAvailable &&
                                    updatePriority >= IMMEDIATE_UPDATE_PRIORITY_THRESHOLD &&
                                    info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
                    ) {
                        // Priority hight -> Start update flow IMMEDIATE
                        startUpdate(info, AppUpdateType.IMMEDIATE, promise)
                    } else if (isUpdateAvailable && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)
                    ) {
                        // Priority low/medium -> Start update flow FLEXIBLE
                        startUpdate(info, AppUpdateType.FLEXIBLE, promise)
                    } else {
                        promise.resolve("No update available or type not allowed.")
                    }
                }
                .addOnFailureListener { e -> promise.reject("CHECK_UPDATE_FAILED", e) }
    }

    private fun startUpdate(info: AppUpdateInfo, type: Int, promise: Promise?) {
        currentActivity?.let { activity ->
            try {
                appUpdateManager.startUpdateFlowForResult(
                        info,
                        activity,
                        AppUpdateOptions.newBuilder(type).build(),
                        REQUEST_CODE
                )
                promise?.resolve(
                        "Update flow started (type: ${if (type == AppUpdateType.IMMEDIATE) "IMMEDIATE" else "FLEXIBLE"})"
                )
            } catch (e: IntentSender.SendIntentException) {
                promise?.reject("START_UPDATE_FAILED", "Failed to start update flow.", e)
            }
        }
                ?: run {
                    promise?.reject(
                            "E_NO_ACTIVITY",
                            "Current activity is null, cannot start update flow."
                    )
                }
    }

    private fun popupSnackbarForCompleteUpdate() {
        val activity = currentActivity ?: return
        val view = activity.findViewById<android.view.View>(android.R.id.content)

        Snackbar.make(
                        view,
                        "A atualização foi concluída. Reinicie para ter os recursos atualizados.",
                        Snackbar.LENGTH_INDEFINITE
                )
                .setAction("REINICIAR") { appUpdateManager.completeUpdate() }
                .show()
    }

    override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
    ) {
        if (requestCode == REQUEST_CODE) {
            if (resultCode != Activity.RESULT_OK) {
                // The user canceled the update (mainly applicable for the FLEXIBLE flow).
                // For IMMEDIATE, the app usually closes or the Play Store handles new prompts.
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
