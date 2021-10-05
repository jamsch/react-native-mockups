import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import type { Meta } from '@jamsch/react-native-mockups';

export default {
  title: 'LoadingIndicator',
  component: () => (
    <View style={styles.container}>
      <Text>Default</Text>
      <LoadingIndicator />

      <Text>Custom color</Text>
      <LoadingIndicator color="red" />

      <Text>size=small</Text>
      <LoadingIndicator size="small" />
    </View>
  ),
} as Meta;

const styles = StyleSheet.create({
  container: { padding: 10 },
});
