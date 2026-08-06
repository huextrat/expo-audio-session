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

  /**
   * Deactivating the session throws while audio I/O is still winding down (it
   * takes a few ms after a pause) — the module retries instead of giving up,
   * because a failed deactivation means the user's music never resumes.
   *
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Delay between deactivation attempts, in milliseconds.
   *
   * @default 150
   */
  retryDelayMs?: number;
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
