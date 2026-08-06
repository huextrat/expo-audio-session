import AVFoundation
import ExpoModulesCore

struct DeactivateOptions: Record {
  /**
   * Pass `.notifyOthersOnDeactivation` when deactivating, so other audio apps
   * (Spotify, Apple Music…) are told they can resume playback. This is the
   * whole point of the module — only disable it if you know what you're doing.
   */
  @Field var notifyOthersOnDeactivation: Bool = true
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

    AsyncFunction("deactivateAsync") { (options: DeactivateOptions?) in
      let options = options ?? DeactivateOptions()
      let deactivationOptions: AVAudioSession.SetActiveOptions =
        options.notifyOthersOnDeactivation ? [.notifyOthersOnDeactivation] : []
      try AVAudioSession.sharedInstance().setActive(false, options: deactivationOptions)
    }
  }
}
