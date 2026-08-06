Pod::Spec.new do |s|
  s.name           = 'ExpoAudioSession'
  s.version        = '1.0.0'
  s.summary        = 'Deactivate the iOS audio session so background audio apps can resume'
  s.description    = 'Expo module that deactivates the shared AVAudioSession with notifyOthersOnDeactivation once your app is done playing audio, so background audio apps (Spotify, Apple Music…) resume playback.'
  s.author         = 'Hugo Extrat'
  s.homepage       = 'https://github.com/huextrat/expo-audio-session'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: 'https://github.com/huextrat/expo-audio-session' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.frameworks = 'AVFoundation'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
