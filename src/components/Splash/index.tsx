import React from 'react';
import { StyleSheet } from 'react-native';

import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

// expo-video needs a plain require() for the metro asset bundler
// eslint-disable-next-line @typescript-eslint/no-var-requires
const videoSource = require('@assets/SplashScreen.mp4');

type Props = {
  onComplete: () => void;
};

export function Splash({ onComplete }: Props) {
  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.muted = true;
    videoPlayer.loop = false;
    videoPlayer.play();
  });

  useEventListener(player, 'playToEnd', () => {
    onComplete();
  });

  return (
    <VideoView
      player={player}
      contentFit='cover'
      nativeControls={false}
      style={StyleSheet.absoluteFill}
    />
  );
}
