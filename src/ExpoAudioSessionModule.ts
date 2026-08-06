import { NativeModule, requireNativeModule } from 'expo';

import { type DeactivateOptions } from './ExpoAudioSession.types';

declare class ExpoAudioSessionModule extends NativeModule {
  /**
   * Deactivate the shared audio session with `.notifyOthersOnDeactivation`,
   * telling background audio apps (Spotify, Apple Music…) they can resume.
   * Call it once your app is done outputting audio (video closed, muted…).
   *
   * Deactivation fails while audio I/O is still running — stop or mute
   * playback first (or use `deactivateKeepingPlayback`).
   *
   * No-op on Android.
   */
  deactivateAsync(options?: DeactivateOptions): Promise<void>;
}

export default requireNativeModule<ExpoAudioSessionModule>('ExpoAudioSession');
