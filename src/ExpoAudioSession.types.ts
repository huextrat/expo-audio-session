export interface DeactivateOptions {
  /**
   * Pass `.notifyOthersOnDeactivation` when deactivating the session, so other
   * audio apps (Spotify, Apple Music…) are told they can resume playback.
   * This is the whole point of the module — only disable it if you know what
   * you're doing.
   *
   * @default true
   */
  notifyOthersOnDeactivation?: boolean;
}

/**
 * Minimal player shape needed by `deactivateKeepingPlayback` — matches
 * `VideoPlayer` from expo-video (and `AudioPlayer` from expo-audio) without
 * depending on either package.
 */
export interface PausablePlayer {
  playing: boolean;
  pause(): void;
  play(): void;
}
