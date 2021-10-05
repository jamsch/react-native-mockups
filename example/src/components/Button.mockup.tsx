import React from 'react';
import { View } from 'react-native';
import Button from './Button';
import type { Meta } from '@jamsch/react-native-mockups';

export default {
  title: 'Button',
  component: () => (
    <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
      <Button title="Primary button (Large)" color="primary" size="large" />
      <Button title="Secondary button (Large)" color="secondary" size="large" />
      <View style={{ margin: 10 }} />
      <Button title="Primary button (regular)" color="primary" size="regular" />
      <Button
        title="Secondary button (regular)"
        color="secondary"
        size="regular"
      />
      <View style={{ margin: 10 }} />
      <Button title="Primary button (small)" color="primary" size="small" />
      <Button title="Secondary button (small)" color="secondary" size="small" />
    </View>
  ),
} as Meta;
