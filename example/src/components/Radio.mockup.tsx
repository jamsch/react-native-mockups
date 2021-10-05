import React, { useState } from 'react';
import { View } from 'react-native';
import Radio from './Radio';
import type { Meta } from '@jamsch/react-native-mockups';

const values = ['Easy', 'Medium', 'Hard'] as const;

function RadioMockup() {
  const [value, setValue] = useState('easy');
  return (
    <View>
      <View>
        <Radio.Group value={value} onValueChange={setValue}>
          {values.map((v) => (
            <Radio.Option label={v} value={v} key={v} />
          ))}
        </Radio.Group>
      </View>
    </View>
  );
}

export default {
  title: 'Radio',
  component: RadioMockup,
} as Meta;
