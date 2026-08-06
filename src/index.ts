import { type DeactivateOptions, type PausablePlayer } from './ExpoAudioSession.types';
import ExpoAudioSession from './ExpoAudioSessionModule';

export { default } from './ExpoAudioSessionModule';
export * from './ExpoAudioSession.types';

/**
 * Deactivate the audio session under a player that keeps playing muted: iOS
 * refuses to deactivate the session while audio I/O is running, so this
 * helper briefly pauses the player around the `deactivateAsync` call and
 * resumes it afterwards. Invisible in practice on a muted looping video.
 *
 * The player accessors are guarded (the native player may already have been
 * released), but a deactivation failure is rethrown — catch it if the music
 * not resuming is acceptable for your use case.
 */
export async function deactivateKeepingPlayback(
  player: PausablePlayer,
  options?: DeactivateOptions
): Promise<void> {
  let wasPlaying = false;
  try {
    wasPlaying = player.playing;
    if (wasPlaying) {
      player.pause();
    }
  } catch {
    // Native player object may already be released; ignore.
  }

  try {
    await ExpoAudioSession.deactivateAsync(options);
  } finally {
    try {
      if (wasPlaying) {
        player.play();
      }
    } catch {
      // Native player object may already be released; ignore.
    }
  }
}
