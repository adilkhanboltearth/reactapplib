package com.boltearth.reactnativesdk

import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.os.Bundle
import com.boltearthsdk.BoltAuthResult
import com.boltearthsdk.BoltEarthUiSdk
import com.boltearthsdk.BoltLogoutResult
import com.boltearthsdk.SdkFontOverrides
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.UIBlock
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

@ReactModule(name = BoltEarthUiSdkModule.NAME)
class BoltEarthUiSdkModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

  override fun invalidate() {
    super.invalidate()
    moduleScope.cancel()
  }

  override fun getName(): String = NAME

  @ReactMethod
  fun initialize(config: ReadableMap) {
    val ctx = reactApplicationContext
    val userId =
      config.getString("userId") ?: throw IllegalArgumentException("initialize: userId is required")
    val sdkToken =
      config.getString("sdkToken")
        ?: throw IllegalArgumentException("initialize: sdkToken is required")

    val sdkPackage = if (config.hasKey("sdkPackage")) config.getString("sdkPackage").orEmpty() else ""
    val primaryColor =
      if (config.hasKey("primaryColor")) config.getString("primaryColor").orEmpty() else ""
    val localeLanguageTag =
      if (config.hasKey("localeLanguageTag")) config.getString("localeLanguageTag").orEmpty() else ""
    val enableNetworkLogging =
      if (config.hasKey("enableNetworkLogging")) config.getBoolean("enableNetworkLogging") else false

    val fonts =
      if (config.hasKey("fontOverrides")) {
        parseFontOverrides(config.getMap("fontOverrides")!!)
      } else {
        SdkFontOverrides()
      }

    BoltEarthUiSdk.initialize(
      ctx,
      userId,
      sdkToken,
      sdkPackage,
      primaryColor,
      fonts,
      localeLanguageTag,
      enableNetworkLogging,
    )
  }

  @ReactMethod
  fun setNetworkLoggingEnabled(enabled: Boolean) {
    BoltEarthUiSdk.setNetworkLoggingEnabled(enabled)
  }

  @ReactMethod
  fun setNetworkLoggingEnabledForContext(enabled: Boolean) {
    BoltEarthUiSdk.setNetworkLoggingEnabled(reactApplicationContext, enabled)
  }

  @ReactMethod
  fun ensureLoggedIn(promise: Promise) {
    BoltEarthUiSdk.ensureLoggedIn(reactApplicationContext) { result ->
      promise.resolve(authResultToMap(result))
    }
  }

  @ReactMethod
  fun ensureLoggedInForcingRelogin(promise: Promise) {
    BoltEarthUiSdk.ensureLoggedInForcingRelogin(reactApplicationContext) { result ->
      promise.resolve(authResultToMap(result))
    }
  }

  @ReactMethod
  fun logout(promise: Promise) {
    BoltEarthUiSdk.logout(reactApplicationContext) { result ->
      promise.resolve(logoutResultToMap(result))
    }
  }

  @ReactMethod
  fun hasValidSession(promise: Promise) {
    promise.resolve(BoltEarthUiSdk.hasValidSession(reactApplicationContext))
  }

  @ReactMethod
  fun applyStatusBarColor(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No Android Activity is available")
      return
    }
    try {
      BoltEarthUiSdk.applyStatusBarColor(activity)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_STATUS_BAR", e.message, e)
    }
  }

  @ReactMethod
  fun tintViewTree(reactTag: Int, promise: Promise) {
    val uiManager = reactApplicationContext.getNativeModule(UIManagerModule::class.java)
    if (uiManager == null) {
      promise.reject("E_UI_MANAGER", "UIManagerModule is not available")
      return
    }
    try {
      uiManager.addUIBlock(
        UIBlock { nvhm ->
          try {
            val view = nvhm.resolveView(reactTag)
            if (view == null) {
              promise.reject("E_TINT_VIEW", "Could not resolve view for reactTag=$reactTag")
              return@UIBlock
            }
            BoltEarthUiSdk.tintViewTree(view)
            promise.resolve(null)
          } catch (e: Exception) {
            promise.reject("E_TINT_VIEW", e.message, e)
          }
        },
      )
    } catch (e: Exception) {
      promise.reject("E_TINT_SCHEDULE", e.message, e)
    }
  }

  @ReactMethod
  fun wrapContextWithTheme(promise: Promise) {
    try {
      BoltEarthUiSdk.wrapContextWithTheme(reactApplicationContext)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_WRAP_CONTEXT", e.message, e)
    }
  }

  @ReactMethod
  fun resetLocalSessionBeforeUserSwitch(promise: Promise) {
    moduleScope.launch {
      try {
        BoltEarthUiSdk.resetLocalSessionBeforeUserSwitch(reactApplicationContext)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("E_RESET_LOCAL_SESSION", e.message, e)
      }
    }
  }

  @ReactMethod
  fun openUsersBookingsList(promise: Promise) {
    try {
      val launchContext =
        reactApplicationContext.currentActivity
          ?: newTaskApplicationContext(reactApplicationContext)
      BoltEarthUiSdk.openUsersBookingsList(launchContext)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_OPEN_BOOKINGS", e.message, e)
    }
  }

  @ReactMethod
  fun openChargerBookingFlow(promise: Promise) {
    try {
      val intent = Intent(reactApplicationContext, ChargerBookingHostActivity::class.java)
      val activity = reactApplicationContext.currentActivity
      if (activity != null) {
        activity.startActivity(intent)
      } else {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
      }
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("E_OPEN_CHARGER_BOOKING", e.message, e)
    }
  }

  private fun newTaskApplicationContext(appContext: Context): Context {
    return object : ContextWrapper(appContext) {
      override fun startActivity(intent: Intent) {
        if (intent.flags and Intent.FLAG_ACTIVITY_NEW_TASK == 0) {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        baseContext.startActivity(intent)
      }

      override fun startActivity(intent: Intent, options: Bundle?) {
        if (intent.flags and Intent.FLAG_ACTIVITY_NEW_TASK == 0) {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        baseContext.startActivity(intent, options)
      }
    }
  }

  private fun parseFontOverrides(m: ReadableMap): SdkFontOverrides {
    fun optInt(key: String): Int = if (m.hasKey(key)) m.getInt(key) else 0
    return SdkFontOverrides(
      optInt("light"),
      optInt("regular"),
      optInt("medium"),
      optInt("semiBold"),
      optInt("bold"),
    )
  }

  private fun authResultToMap(result: BoltAuthResult): WritableMap {
    val map = Arguments.createMap()
    when (result) {
      is BoltAuthResult.Success -> map.putString("type", "success")
      is BoltAuthResult.Failure -> {
        map.putString("type", "failure")
        val err = result.error
        map.putString("errorMessage", err?.message)
        map.putString("errorClass", err?.javaClass?.name)
      }
      else -> map.putString("type", "unknown")
    }
    return map
  }

  private fun logoutResultToMap(result: BoltLogoutResult): WritableMap {
    val map = Arguments.createMap()
    when (result) {
      is BoltLogoutResult.Success -> map.putString("type", "success")
      is BoltLogoutResult.Failure -> {
        map.putString("type", "failure")
        val err = result.error
        map.putString("errorMessage", err?.message)
        map.putString("errorClass", err?.javaClass?.name)
      }
      else -> map.putString("type", "unknown")
    }
    return map
  }

  companion object {
    const val NAME = "BoltEarthUiSdk"
  }
}
