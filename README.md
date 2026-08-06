<div align="center">

# 🎧 Expo Audio Session

**Resume the user's background music after your app plays audio**

<p align="center">
  <a href="https://github.com/huextrat/expo-audio-session/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" />
  </a>
  <a href="https://www.npmjs.com/package/expo-audio-session">
    <img alt="npm version" src="https://img.shields.io/npm/v/expo-audio-session.svg?style=for-the-badge" />
  </a>
  <a href="https://www.npmjs.com/package/expo-audio-session">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/expo-audio-session.svg?style=for-the-badge" />
  </a>
</p>

*An Expo module that deactivates the shared iOS audio session (`AVAudioSession`) once your app is done playing audio, notifying other audio apps (Spotify, Apple Music…) that they can resume playback. Built to fix the classic `expo-video` issue where the user's background music stays paused forever after a video played with sound.*

</div>

---

## 🐛 The Problem

`expo-video` activates the shared `AVAudioSession` whenever one of its players outputs audio — but it **never deactivates it**. The consequences for your users:

- 🎵 They're listening to Spotify / Apple Music
- 📹 They open a video in your app, with sound → their music pauses (expected)
- ❌ They close the video → **their music never resumes**

On iOS, the only way to tell other apps they can resume is to deactivate your audio session with the `.notifyOthersOnDeactivation` option. That's exactly what this module does.

---

## ✨ Features

- Deactivate the iOS audio session with `.notifyOthersOnDeactivation` so background music resumes
- Automatic retry while audio I/O winds down (deactivating a busy session throws)
- Pre-set a mixable playback category at startup, so the very first muted autoplay video doesn't cut the user's music on a cold app start
- `deactivateKeepingPlayback` helper for players that keep playing muted (feeds, loops)
- No config plugin needed — just install and rebuild
- Safe to call from shared code — no-op on Android

---

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install expo-audio-session

# Using yarn
yarn add expo-audio-session

# Using pnpm
pnpm add expo-audio-session

# Using Expo CLI
npx expo install expo-audio-session
```

> **ℹ️ Note:** This module contains native code — rebuild your dev client (`npx expo prebuild` + build, or `eas build`) after installing. No config plugin required, autolinking does everything.

## 📖 Usage

### 🎯 Basic Example

```typescript
import ExpoAudioSession from 'expo-audio-session';

// 1. At app startup, before the first player is created (optional but
// recommended): pre-set the mixable playback category so a muted autoplay
// video doesn't cut the user's music on a cold app start.
await ExpoAudioSession.prepareAsync();

// 2. When your app is done outputting audio (video closed, player muted…):
// the user's background music resumes.
await ExpoAudioSession.deactivateAsync();
```

### 🎬 With expo-video

```tsx
import ExpoAudioSession from 'expo-audio-session';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';

export function FullscreenVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (player) => {
    player.play();
  });

  useEffect(() => {
    return () => {
      // The screen closes → tell iOS we are done with audio so the user's
      // music resumes. The player is released on unmount, so audio I/O stops
      // and deactivation succeeds (after a short retry).
      ExpoAudioSession.deactivateAsync().catch(() => {
        // Another player still outputs sound or the session is already
        // inactive: the music simply does not resume, never fatal.
      });
    };
  }, []);

  return <VideoView player={player} style={{ flex: 1 }} />;
}
```

### 🔇 Video that keeps playing muted

iOS refuses to deactivate the session while audio I/O is running. If your player keeps playing (e.g. a feed video that goes back to muted after fullscreen), use the helper — it briefly pauses the player around the deactivation, invisible in practice on a muted looping video:

```typescript
import { deactivateKeepingPlayback } from 'expo-audio-session';

player.muted = true;
await deactivateKeepingPlayback(player);
```

## 📚 API Reference

### 🔧 Methods

#### `prepareAsync(): Promise<void>`

Pre-set the mixable playback category (`.playback` / `.moviePlayback` / `[.mixWithOthers]`) while the session is still inactive. Call it **once at app startup**, before the first player is created.

Why: `AVPlayer` implicitly activates the session the moment playback starts, *before* `expo-video`'s async session update has landed — on a cold app the category is still the default (non-mixable), so the very first muted autoplay video would cut the user's music. With the category set up front, that implicit activation mixes. `expo-video` keeps managing the options afterwards (removing `mixWithOthers` when a video plays audibly).

No-op on Android.

#### `deactivateAsync(options?: DeactivateOptions): Promise<void>`

Deactivate the shared audio session, notifying other audio apps they can resume. Call it once your app is done outputting audio. Retries a few times while audio I/O winds down, and rejects if the session could not be deactivated (typically: another player is still outputting sound).

No-op on Android.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `notifyOthersOnDeactivation` | `boolean` | `true` | Tell other audio apps they can resume — the whole point of the module |
| `maxAttempts` | `number` | `3` | Deactivation attempts before rejecting |
| `retryDelayMs` | `number` | `150` | Delay between attempts, in milliseconds |

#### `deactivateKeepingPlayback(player: PausablePlayer, options?: DeactivateOptions): Promise<void>`

Deactivate the session under a player that keeps playing muted: briefly pauses the player around the `deactivateAsync` call and resumes it afterwards. `PausablePlayer` is the minimal `{ playing, pause(), play() }` shape — `VideoPlayer` from `expo-video` matches it out of the box.

---

## 📱 Platform Support

<table>
<tr>
<td width="33%" align="center">

**🍎 iOS**
- Full `AVAudioSession` support
- `.notifyOthersOnDeactivation`
- Automatic retry

</td>
<td width="33%" align="center">

**🤖 Android**
- No-op for compatibility
- Audio focus is per-request: whoever plays the audio (ExoPlayer) requests and abandons its own focus — nothing an external module can safely release
- See [What about Android?](#-what-about-android) for the `expo-video` patch that fixes it

</td>
<td width="33%" align="center">

**🌐 Web**
- Not supported
- Will throw errors if used

</td>
</tr>
</table>

---

## 🤖 What about Android?

Android has the same symptom (music never resumes after a video played with sound), but the cause — and the fix — live inside `expo-video` itself, which is why this module is a no-op there.

On Android, audio focus is per-request: ExoPlayer requests focus when playback starts and abandons it when playback stops. The problem is the focus *type* `expo-video` requests in `AudioMixingMode.AUTO` (the default): `AUDIOFOCUS_GAIN` signals a **permanent** takeover, so music apps (Spotify, YouTube Music…) treat it as "this app owns audio now" and never resume when the focus is abandoned. Requesting `AUDIOFOCUS_GAIN_TRANSIENT` instead signals a **temporary** interruption — music apps pause, then resume by themselves once your video stops outputting audio.

Until this is fixed upstream, patch `expo-video` with [`yarn patch`](https://yarnpkg.com/cli/patch) (or [`patch-package`](https://github.com/ds300/patch-package) for npm):

```bash
yarn patch expo-video
# edit the file below inside the printed folder, then:
yarn patch-commit -s <printed-folder>
```

Apply this change in `android/src/main/java/expo/modules/video/managers/AudioFocusManager.kt`:

```diff
     val audioFocusType = when (audioMixingMode) {
       AudioMixingMode.DUCK_OTHERS -> AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
-      AudioMixingMode.AUTO -> AudioManager.AUDIOFOCUS_GAIN
+      // Transient focus so music apps (Spotify…) resume by themselves once
+      // our video stops outputting audio and the focus is abandoned.
+      // A permanent AUDIOFOCUS_GAIN never resumes them.
+      AudioMixingMode.AUTO -> AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
       AudioMixingMode.DO_NOT_MIX -> AudioManager.AUDIOFOCUS_GAIN
       else -> AudioManager.AUDIOFOCUS_GAIN
     }
```

Then rebuild your dev client. No call to this module is needed on Android — the patch alone makes the music resume.

---

## 🛠️ Troubleshooting

### 🚨 Common Issues

<details>
<summary><strong>🎵 The music does not resume</strong></summary>

**Problem**: `deactivateAsync()` rejects, or resolves but the music stays paused.

**Solution**: iOS refuses to deactivate the session while audio I/O is running. Make sure **every** player is paused, released, or muted before calling `deactivateAsync()`. For a player that must keep playing muted, use `deactivateKeepingPlayback(player)`.

</details>

<details>
<summary><strong>🥶 The very first muted video cuts the music</strong></summary>

**Problem**: On a cold app start, a muted autoplay video pauses the user's music even though it makes no sound.

**Solution**: Call `ExpoAudioSession.prepareAsync()` at app startup, before the first player is created. It pre-sets the mixable playback category, so the implicit session activation done by `AVPlayer` mixes with the user's music instead of interrupting it.

</details>

<details>
<summary><strong>⚙️ `Cannot find native module 'ExpoAudioSession'`</strong></summary>

**Problem**: The native module is not found at runtime.

**Solution**:
1. This module contains native code and does not work in Expo Go — use a dev client
2. Rebuild your dev client after installing (`npx expo prebuild` + build, or `eas build`)
3. Clean and rebuild your project

</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔄 **Open** a Pull Request

### 🐛 Found a Bug?

Please open an issue with:
- 📱 Device information
- 📋 Steps to reproduce
- 📝 Expected vs actual behavior

### 💡 Have an Idea?

We'd love to hear your suggestions! Open an issue with the `enhancement` label.

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

</div>
