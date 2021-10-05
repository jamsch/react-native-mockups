import React, { useContext } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

interface RadioContextProps<TValue> {
  value: TValue;
  onValueChange: (value: TValue) => void;
}
const RadioContext = React.createContext<RadioContextProps<any> | null>(null);

// Radio Button Group
interface RadioGroupProps<TValue> {
  onValueChange: (value: TValue) => void;
  value: TValue;
  children: React.ReactNode;
}

/**
 * Basic usage:
 *
 ```jsx
 function MyComponent() {
    const dispatch = useDispatch();
    const onChange = (difficulty: string) => dispatch(updateRRDifficulty(difficulty));
    return (
      <Radio.Group onValueChange={onChange} value={store.rrDifficulty}>
        <Radio.Button value="beginner" />
        <Radio.Button value="advanced" />
      </Radio.Group>
    );
 }
 ```
 */
const Radio = {
  Group<TValue>({ onValueChange, value, children }: RadioGroupProps<TValue>) {
    return (
      <RadioContext.Provider value={{ value, onValueChange }}>
        {children}
      </RadioContext.Provider>
    );
  },
  /** Circular button */
  Button({ value }: { value: string }) {
    const context = useContext(RadioContext);
    if (!context) {
      return null;
    }

    return (
      <Pressable
        accessibilityState={{
          checked: context.value === value,
        }}
        onPress={() => context.onValueChange(value)}
        android_ripple={{ borderless: true }}
      >
        <View style={styles.radioButtonContainer}>
          {context.value === value ? (
            <View style={styles.radioButtonSelected} />
          ) : null}
        </View>
      </Pressable>
    );
  },
  Option(props: { value: any; label: string }) {
    const context = useContext(RadioContext);
    if (!context) {
      return null;
    }
    return (
      <Pressable
        onPress={() => context.onValueChange(props.value)}
        android_ripple={{ borderless: true }}
      >
        <View style={styles.radioOptionContainer}>
          <Text style={styles.flex}>{props.label}</Text>
          <Radio.Button value={props.value} />
        </View>
      </Pressable>
    );
  },
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  radioButtonContainer: {
    alignItems: 'center',
    borderColor: '#3c8dbc',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    margin: 8,
    width: 20,
  },
  radioButtonSelected: {
    backgroundColor: '#3c8dbc',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  radioOptionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  radioTickContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    margin: 8,
    width: 20,
  },
  tickOptionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default Radio;
