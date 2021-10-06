import React from 'react';

import { SafeAreaView, StyleSheet, Text } from 'react-native';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups';

export default function AppWithServer() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Mockups</Text>
      <MockupRoot mockups={mockups} server="localhost:1337" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
