import AVFoundation
import ExpoModulesCore

struct DeactivateOptions: Record {
  /**
   * Pass `.notifyOthersOnDeactivation` when deactivating, so other audio apps
   * (Spotify, Apple Music…) are told they can resume playback. This is the
   * whole point of the module — only disable it if you know what you're doing.
   */
  @Field var notifyOthersOnDeactivation: Bool = true

  /**
   * Deactivating the session throws while audio I/O is still winding down
   * (it takes a few ms after a pause) — retry instead of giving up, because a
   * failed deactivation means the user's music never resumes.
   */
  @Field var maxAttempts: Int = 3

  /** Delay between deactivation attempts, in milliseconds. */
  @Field var retryDelayMs: Int = 150
}

/**
 * expo-video activates the shared AVAudioSession whenever one of its players
 * outputs audio, but never deactivates it — so the user's background music
 * (Spotify…) stays paused forever after a video played with sound.
 *
 * This module exposes the missing half: deactivating the session with
 * `.notifyOthersOnDeactivation`, which tells other audio apps they can
 * resume. Deactivation fails (harmlessly) while audio I/O is still running,
 * so callers should stop/mute playback first.
 */
public class ExpoAudioSessionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAudioSession")

    // Pre-set the mixable playback category while the session is still
    // inactive. AVPlayer implicitly activates the session the moment playback
    // starts, BEFORE expo-video's async session update has landed — on a cold
    // app the category is still the default (non-mixable), so the very first
    // muted autoplay video would cut the user's music. With the category set
    // up front, that implicit activation mixes. expo-video keeps managing the
    // options afterwards (removing mixWithOthers when a video plays audibly).
    AsyncFunction("prepareAsync") {
      try AVAudioSession.sharedInstance()
        .setCategory(.playback, mode: .moviePlayback, options: [.mixWithOthers])
    }

    AsyncFunction("deactivateAsync") { (options: DeactivateOptions?) async throws in
      let options = options ?? DeactivateOptions()
      let session = AVAudioSession.sharedInstance()
      let deactivationOptions: AVAudioSession.SetActiveOptions =
        options.notifyOthersOnDeactivation ? [.notifyOthersOnDeactivation] : []

      var lastError: Error?
      for attempt in 0..<max(options.maxAttempts, 1) {
        if attempt > 0 {
          try? await Task.sleep(nanoseconds: UInt64(max(options.retryDelayMs, 0)) * 1_000_000)
        }
        do {
          try session.setActive(false, options: deactivationOptions)
          return
        } catch {
          lastError = error
        }
      }
      if let lastError {
        throw lastError
      }
    }
  }
}
