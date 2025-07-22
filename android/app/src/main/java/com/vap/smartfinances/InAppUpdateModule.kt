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
        private const val MY_REQUEST_CODE = 501
        private const val IMMEDIATE_UPDATE_PRIORITY_THRESHOLD =
                4 // Prioridade 4 e 5 serão Imediatas
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

    // Adiciona o onResume para lidar com o fluxo de atualização imediata quando o app volta do
    // background
    @ReactMethod
    fun onResume() {
        appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.updateAvailability() ==
                            UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
            ) {
                // Se uma atualização imediata já está em progresso, reinicie o fluxo.
                startUpdate(info, AppUpdateType.IMMEDIATE, null)
            }
        }
    }

    @ReactMethod
    fun checkForUpdates(promise: Promise) {
        appUpdateManager.appUpdateInfo
                .addOnSuccessListener { info ->
                    this.appUpdateInfo = info // Armazena a informação da atualização

                    val updatePriority = info.updatePriority()
                    val isUpdateAvailable =
                            info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE

                    // Lógica para decidir entre Imediata e Flexível
                    if (isUpdateAvailable &&
                                    updatePriority >= IMMEDIATE_UPDATE_PRIORITY_THRESHOLD &&
                                    info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
                    ) {
                        // Prioridade alta -> Iniciar fluxo IMEDIATO
                        startUpdate(info, AppUpdateType.IMMEDIATE, promise)
                    } else if (isUpdateAvailable && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)
                    ) {
                        // Prioridade baixa/média -> Iniciar fluxo FLEXÍVEL
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
                        MY_REQUEST_CODE
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
        if (requestCode == MY_REQUEST_CODE) {
            if (resultCode != Activity.RESULT_OK) {
                // O usuário cancelou a atualização (aplicável principalmente para o fluxo
                // Flexível).
                // Para o Imediato, o app geralmente fecha ou a Play Store lida com novos prompts.
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
