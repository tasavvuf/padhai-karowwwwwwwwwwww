package expo.modules.focusengine

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledExecutorService
import java.util.concurrent.TimeUnit

class FocusMonitoringService : Service() {
  private val executor: ScheduledExecutorService = Executors.newSingleThreadScheduledExecutor()
  private var sessionId: String = ""
  private var distractingPackages: Set<String> = emptySet()
  private var lastPackage: String? = null
  private var pollingStarted = false

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, buildNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, buildNotification())
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    sessionId = intent?.getStringExtra(EXTRA_SESSION_ID) ?: sessionId
    distractingPackages = intent?.getStringArrayListExtra(EXTRA_DISTRACTING_PACKAGES)?.toSet() ?: distractingPackages
    if (executor.isShutdown) return START_NOT_STICKY
    if (!pollingStarted) {
      pollingStarted = true
      executor.scheduleWithFixedDelay({ pollForegroundApp() }, 0, POLL_INTERVAL_MS, TimeUnit.MILLISECONDS)
    }
    return START_NOT_STICKY
  }

  private fun pollForegroundApp() {
    val usage = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val end = System.currentTimeMillis()
    val events = usage.queryEvents(end - LOOKBACK_MS, end)
    val event = UsageEvents.Event()
    var foregroundPackage: String? = null
    var latestTimestamp = 0L
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND && event.timeStamp >= latestTimestamp) {
        latestTimestamp = event.timeStamp
        foregroundPackage = event.packageName
      }
    }
    if (foregroundPackage.isNullOrBlank() || foregroundPackage == packageName || foregroundPackage == lastPackage) return
    lastPackage = foregroundPackage
    val appName = try {
      packageManager.getApplicationLabel(packageManager.getApplicationInfo(foregroundPackage, 0)).toString()
    } catch (e: PackageManager.NameNotFoundException) {
      foregroundPackage
    }
    sendBroadcast(Intent(ACTION_FOREGROUND_APP).apply {
      setPackage(packageName)
      putExtra(EXTRA_SESSION_ID, sessionId)
      putExtra(EXTRA_PACKAGE, foregroundPackage)
      putExtra(EXTRA_APP_NAME, appName)
      putExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())
      putExtra(EXTRA_IS_DISTRACTION, distractingPackages.contains(foregroundPackage))
    })
  }

  private fun buildNotification(): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
    val pendingIntent = launchIntent?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Focus monitoring active")
      .setContentText("Padhai Karo is protecting your focus session")
      .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
      .setOngoing(true)
      .setContentIntent(pendingIntent)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Focus monitoring", NotificationManager.IMPORTANCE_LOW))
    }
  }

  override fun onDestroy() {
    executor.shutdownNow()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  companion object {
    const val ACTION_FOREGROUND_APP = "expo.modules.focusengine.FOREGROUND_APP_CHANGED"
    const val EXTRA_SESSION_ID = "sessionId"
    const val EXTRA_DISTRACTING_PACKAGES = "distractingPackages"
    const val EXTRA_PACKAGE = "packageName"
    const val EXTRA_APP_NAME = "appName"
    const val EXTRA_TIMESTAMP = "timestamp"
    const val EXTRA_IS_DISTRACTION = "isDistraction"
    private const val CHANNEL_ID = "focus-monitoring"
    private const val NOTIFICATION_ID = 7341
    private const val LOOKBACK_MS = 10_000L
    private const val POLL_INTERVAL_MS = 1_000L
  }
}
