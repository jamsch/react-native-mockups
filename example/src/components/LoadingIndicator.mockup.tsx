import React from 'react';
import { Text, View } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import type { Meta } from '@jamsch/react-native-mockups';

export default {
  title: 'LoadingIndicator',
  component: () => (
    <View style={{ padding: 10 }}>
      <Text>Default</Text>
      <LoadingIndicator />

      <Text>Custom color</Text>
      <LoadingIndicator color="red" />

      <Text>size=small</Text>
      <LoadingIndicator size="small" />
    </View>
  ),
} as Meta;
