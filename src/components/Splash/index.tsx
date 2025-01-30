import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { hideAsync } from 'expo-splash-screen';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';

type Props = {
  onComplete: (status: boolean) => void;
};

export function Splash({ onComplete }: Props) {
  const [lastStatus, setLastStatus] = useState<AVPlaybackStatus>(
    {} as AVPlaybackStatus
  );

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (status.isLoaded) {
      if (lastStatus.isLoaded !== status.isLoaded) {
        hideAsync();
      }

      if (status.didJustFinish) {
        onComplete(true);
      }
    }

    setLastStatus(() => status);
  }

  return (
    <Video
      source={require('@assets/SplashScreen.mp4')}
      shouldPlay
      isMuted
      isLooping={false}
      resizeMode={ResizeMode.COVER}
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      style={StyleSheet.absoluteFill}
    />
  );
}
