import React, { useCallback, useContext, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
} from 'react-native';
import MockupProvider, { MockupContext } from './MockupProvider';
import type { FileMap, MockupBaseProps, MockupWrapperComponent } from './types';
import { formatMockupName, useSortedMockups } from './utils';
export { MockupWrapperComponent, MockupWrapperProps } from './types';

export interface Meta {
  title: string;
  description?: string;
  component?: React.ComponentType;
}

export interface MockupRootRef {
  /** Navigates to a specific mockup (or back to the root view) */
  navigate(path: string | null): void;
}

export interface MockupRootProps<T extends FileMap> extends MockupBaseProps<T> {
  renderItem?: (params: {
    path: keyof T;
    title: string;
    navigate: (path: keyof T) => void;
  }) => React.ReactNode;
}

export function MockupRoot<T extends FileMap>(props: MockupRootProps<T>) {
  const { Wrapper: PropsWrapper, ...rest } = props;

  // Add back button handling inside mockups
  const Wrapper = useCallback<MockupWrapperComponent>(
    (p) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHandleBack(() => {
        p.navigate(null);
        return true;
      });
      return PropsWrapper ? <PropsWrapper {...p} /> : <p.Component />;
    },
    [PropsWrapper]
  );

  return (
    <MockupProvider Wrapper={Wrapper} {...rest}>
      {/* @ts-ignore */}
      <MockupRootView {...props} />
    </MockupProvider>
  );
}

function MockupRootView<T extends FileMap>(props: MockupRootProps<T>) {
  const { mockups, renderItem } = props;
  const [, setActiveMockup] = useContext(MockupContext);

  const navigate = (path: keyof T) => {
    setActiveMockup(path as string);
  };

  const sortedMockups = useSortedMockups(mockups);

  return (
    <ScrollView style={styles.container}>
      {sortedMockups.map(({ key, value }) => {
        // @ts-ignore
        const Mockup = value.default;
        const title = Mockup.title || formatMockupName(key);

        if (renderItem) {
          return renderItem({
            path: key,
            title,
            navigate,
          });
        }

        return (
          <Pressable
            key={key}
            onPress={() => navigate(key)}
            android_ripple={{ borderless: false }}
          >
            <View style={styles.mockupButton}>
              <Text>{title}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Uses global navigation ref instead of relative navigation ref */
function useHandleBack(callback: () => boolean) {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', callback);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', callback);
    };
  }, [callback]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mockupButton: {
    borderColor: '#ccc',
    borderBottomWidth: 1,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  folder: {
    paddingHorizontal: 5,
  },
  folderTitle: {
    fontWeight: 'bold',
  },
});
