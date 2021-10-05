import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';

interface ButtonProps {
  title: string;
  color?: 'primary' | 'secondary';
  size?: 'small' | 'regular' | 'large';
  onPress?: () => void;
}

export default function Button(props: ButtonProps) {
  const { title, color, size, onPress } = props;
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          containerStyles.button,
          containerStyles[color || 'primary'],
          containerStyles[size || 'regular'],
        ]}
      >
        <Text style={textStyles[color || 'primary']}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const containerStyles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 5,
  },
  primary: {
    backgroundColor: '#00a1ff',
  },
  secondary: {
    backgroundColor: '#ff0080',
  },
  large: {
    padding: 20,
  },
  regular: {
    padding: 10,
  },
  small: {
    padding: 5,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: '#fff',
  },
  secondary: {
    color: '#fff',
  },
});
