import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function OAuthCallbackScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' color='#FF5200' />
    </View>
  );
}
