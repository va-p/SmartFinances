import React from 'react';
import { StyleSheet } from 'react-native';

import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = require('@assets/SplashScreen.mp4');

type Props = {
  onComplete: () => void;
};

export function Splash({ onComplete }: Props) {
  const player = useVideoPlayer(videoSource, (player) => {
    player.volume = 0;
    player.loop = false;
    player.play();
  });

  useEventListener(player, 'playToEnd', () => {
    onComplete();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit='cover'
    />
  );
}
