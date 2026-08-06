import { NativeModule, requireNativeModule } from 'expo';

import { type DeactivateOptions } from './ExpoAudioSession.types';

declare class ExpoAudioSessionModule extends NativeModule {
  /**
   * Pre-set the mixable playback category (`.playback`, `.moviePlayback`,
   * `[.mixWithOthers]`) while the audio session is still inactive. Call it
   * once at app startup, before the first player is created.
   *
   * Why: AVPlayer implicitly activates the session the moment playback
   * starts, BEFORE expo-video's async session update has landed — on a cold
   * app the category is still the default (non-mixable), so the very first
   * muted autoplay video would cut the user's music. With the category set up
   * front, that implicit activation mixes. expo-video keeps managing the
   * options afterwards (removing `mixWithOthers` when a video plays audibly).
   *
   * No-op on Android.
   */
  prepareAsync(): Promise<void>;

  /**
   * Deactivate the shared audio session with `.notifyOthersOnDeactivation`,
   * telling background audio apps (Spotify, Apple Music…) they can resume.
   * Call it once your app is done outputting audio (video closed, muted…).
   *
   * Deactivation fails while audio I/O is still running — stop or mute
   * playback first (or use `deactivateKeepingPlayback`). The module retries a
   * few times ({@link DeactivateOptions.maxAttempts}) and rejects if the
   * session could not be deactivated.
   *
   * No-op on Android.
   */
  deactivateAsync(options?: DeactivateOptions): Promise<void>;
}

export default requireNativeModule<ExpoAudioSessionModule>('ExpoAudioSession');
