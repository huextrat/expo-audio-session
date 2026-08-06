package expo.modules.audiosession

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * On Android there is no shared audio session to deactivate: audio focus is
 * managed per-request by whoever plays the audio (expo-video's ExoPlayer
 * requests and abandons its own focus), so there is nothing an external
 * module can safely release. The function is a no-op for cross-platform
 * compatibility — call it unconditionally from JS.
 */
class ExpoAudioSessionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAudioSession")

    // No-op on Android (see class documentation)
    AsyncFunction("deactivateAsync") { options: Map<String, Any?>?, promise: Promise ->
      promise.resolve(Unit)
    }
  }
}
