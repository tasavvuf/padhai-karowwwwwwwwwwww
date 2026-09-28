package expo.modules.focusengine

import android.app.AppOpsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FocusEngineModule : Module() {
  private var receiver: BroadcastReceiver? = null
  private var monitoringSessionId: String? = null

  override fun definition() = ModuleDefinition {
    Name("FocusEngine")
    Events("onForegroundAppChanged")

    Function("hasUsageAccess") {
      hasUsageAccess()
    }

    Function("openUsageAccessSettings") {
      val context = appContext.reactContext ?: return@Function
      context.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      })
    }

    Function("getStatus") {
      status()
    }

    AsyncFunction("startMonitoring") { sessionId: String, distractingPackages: List<String> ->
      if (!hasUsageAccess()) return@AsyncFunction status()
      val context = appContext.reactContext ?: return@AsyncFunction status()
      val intent = Intent(context, FocusMonitoringService::class.java).apply {
        putExtra(FocusMonitoringService.EXTRA_SESSION_ID, sessionId)
        putStringArrayListExtra(
          FocusMonitoringService.EXTRA_DISTRACTING_PACKAGES,
          ArrayList(distractingPackages)
        )
      }
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
      monitoringSessionId = sessionId
      status(true, sessionId)
    }

    AsyncFunction("stopMonitoring") {
      appContext.reactContext?.stopService(Intent(appContext.reactContext, FocusMonitoringService::class.java))
      monitoringSessionId = null
      status(false, null)
    }

    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
          if (intent.action != FocusMonitoringService.ACTION_FOREGROUND_APP) return
          sendEvent("onForegroundAppChanged", mapOf(
            "sessionId" to (intent.getStringExtra(FocusMonitoringService.EXTRA_SESSION_ID) ?: ""),
            "packageName" to (intent.getStringExtra(FocusMonitoringService.EXTRA_PACKAGE) ?: ""),
            "appName" to (intent.getStringExtra(FocusMonitoringService.EXTRA_APP_NAME) ?: ""),
            "timestamp" to intent.getLongExtra(FocusMonitoringService.EXTRA_TIMESTAMP, 0L),
            "isDistraction" to intent.getBooleanExtra(FocusMonitoringService.EXTRA_IS_DISTRACTION, false)
          ))
        }
      }
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(receiver, IntentFilter(FocusMonitoringService.ACTION_FOREGROUND_APP), Context.RECEIVER_NOT_EXPORTED)
      } else {
        @Suppress("DEPRECATION")
        context.registerReceiver(receiver, IntentFilter(FocusMonitoringService.ACTION_FOREGROUND_APP))
      }
    }

    OnDestroy {
      val context = appContext.reactContext
      try {
        receiver?.let { context?.unregisterReceiver(it) }
      } catch (e: Exception) {
      }
      receiver = null
      monitoringSessionId = null
    }
  }

  private fun hasUsageAccess(): Boolean {
    val context = appContext.reactContext ?: return false
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      context.packageName
    ) == AppOpsManager.MODE_ALLOWED
  }

  private fun status(monitoring: Boolean = monitoringSessionId != null, sessionId: String? = monitoringSessionId): Map<String, Any?> = mapOf(
    "available" to true,
    "usageAccessGranted" to hasUsageAccess(),
    "monitoring" to monitoring,
    "sessionId" to sessionId
  )
}
