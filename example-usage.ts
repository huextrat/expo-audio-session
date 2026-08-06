import ExpoAudioSession, { deactivateKeepingPlayback } from 'expo-audio-session';
import { type VideoPlayer } from 'expo-video';

// Example usage of the Audio Session module
export class AudioSessionExample {
  // Call when your app is done outputting audio (e.g. the user closed a
  // video that played with sound): background music resumes.
  static async resumeBackgroundMusic() {
    try {
      await ExpoAudioSession.deactivateAsync();
      console.log('Audio session deactivated, background music resumes');
    } catch (error) {
      // Audio I/O still running (another player outputs sound) or session
      // already inactive: music simply does not resume, never fatal.
      console.error('Failed to deactivate audio session:', error);
    }
  }

  // Call when a video keeps playing but goes back to muted (e.g. the user
  // closed a fullscreen video that keeps looping muted in a feed): briefly
  // pauses the player around the deactivation, since iOS refuses to
  // deactivate the session while audio I/O is running.
  static async resumeBackgroundMusicUnderMutedVideo(player: VideoPlayer) {
    try {
      await deactivateKeepingPlayback(player);
      console.log('Audio session deactivated, background music resumes');
    } catch (error) {
      console.error('Failed to deactivate audio session:', error);
    }
  }
}
