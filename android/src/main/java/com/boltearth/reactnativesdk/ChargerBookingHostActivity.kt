package com.boltearth.reactnativesdk

import android.content.Context
import android.os.Bundle
import com.boltearthsdk.BoltEarthHostActivity
import com.boltearthsdk.BoltEarthUiSdk
import dagger.hilt.android.AndroidEntryPoint

/**
 * Hilt cannot process [AndroidEntryPoint] subclasses of [com.boltearthsdk.BoltEarthHostActivity]
 * (Kotlin default-args / metadata). Theme matches that base activity via [BoltEarthUiSdk].
 */
@AndroidEntryPoint
class ChargerBookingHostActivity : BoltEarthHostActivity() {

  override fun attachBaseContext(newBase: Context) {
    super.attachBaseContext(BoltEarthUiSdk.wrapContextWithTheme(newBase))
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    BoltEarthUiSdk.applyStatusBarColor(this)
    setContentView(R.layout.activity_charger_booking_host)
  }
}
