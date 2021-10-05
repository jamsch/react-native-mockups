import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
  ScrollView,
} from 'react-native';

export interface Meta {
  title: string;
  description?: string;
  component?: React.ComponentType;
}

type FileMap = Record<string, NodeRequire>;

interface MockupBaseProps<T extends FileMap> {
  /** Initial path when mounting */
  initialPath?: keyof T;
  /** List of mockups */
  mockups: T;
  /** When a navigation occurs */
  onNavigate?: (path: keyof T | null) => void;
}

interface MockupContainerProps<T extends FileMap> extends MockupBaseProps<T> {
  children: (params: {
    setSelectedMockup(mockup: keyof T): void;
  }) => React.ReactNode;
}

function MockupContainer<T extends FileMap>({
  mockups,
  initialPath,
  onNavigate,
  children,
}: MockupContainerProps<T>) {
  const [selectedMockup, setSelectedMockup] = useState<keyof T | null>(
    initialPath || null
  );

  useEffect(() => {
    onNavigate?.(selectedMockup);
  }, [onNavigate, selectedMockup]);

  useHandleBack(() => {
    setSelectedMockup(null);
    return true;
  });

  if (selectedMockup) {
    if (!mockups[selectedMockup]) {
      console.warn(`No mockup found with the value: '${selectedMockup}'`);
      setSelectedMockup(null);
      return null;
    }
    // @ts-ignore
    const Mockup = mockups[selectedMockup].default;
    return (
      <View style={styles.container}>
        <Mockup.component />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {children({ setSelectedMockup })}
    </ScrollView>
  );
}

export interface MockupRootProps<T extends FileMap> extends MockupBaseProps<T> {
  renderItem?: (params: {
    path: keyof T;
    title: string;
    setSelectedMockup: (path: keyof T) => void;
  }) => React.ReactNode;
}

export function MockupRoot<T extends FileMap>(props: MockupRootProps<T>) {
  const { mockups } = props;
  const sortedMockups = useMemo(
    () =>
      Object.keys(mockups)
        .map((mockup) => ({
          key: mockup,
          value: mockups[mockup],
          // @ts-ignore
          sortKey: mockups[mockup].title || formatMockupName(mockup),
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey)),
    [mockups]
  );
  return (
    <MockupContainer {...props}>
      {({ setSelectedMockup }) => (
        <View style={styles.container}>
          {sortedMockups.map(({ key, value }) => {
            // @ts-ignore
            const Mockup = value.default;
            const title = Mockup.title || formatMockupName(key);

            if (props.renderItem) {
              return props.renderItem({
                path: key,
                title,
                setSelectedMockup,
              });
            }

            return (
              <Pressable
                key={key}
                onPress={() => setSelectedMockup(key)}
                android_ripple={{ borderless: false }}
              >
                <View style={styles.mockupButton}>
                  <Text>{title}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </MockupContainer>
  );
}

const formatMockupName = (path: string) => {
  // get file name from path
  const fileName = path.split('/').pop();
  return fileName;
};

export function MockupFileExplorer<T extends FileMap>(
  props: MockupRootProps<T>
) {
  const { mockups } = props;
  const groupedMockups = useMemo(() => {
    const values = Object.keys(mockups).reduce((acc, mockup) => {
      const mockupPath = mockup.replace('../', '').split('/');
      const mockupFolder = mockupPath.slice(0, mockupPath.length - 1).join('/');
      if (!acc[mockupFolder]) {
        acc[mockupFolder] = [];
      }
      acc[mockupFolder].push(mockup);
      acc[mockupFolder].sort();
      return acc;
    }, {} as Record<string, string[]>);

    return Object.keys(values)
      .sort()
      .map((folder) => {
        return {
          folder,
          files: values[folder],
        };
      });
  }, [mockups]);

  return (
    <MockupContainer {...props}>
      {({ setSelectedMockup }) => (
        <View>
          {groupedMockups.map((groupedMockup) => {
            return (
              <View key={groupedMockup.folder} style={styles.folder}>
                <Text style={styles.folderTitle}>{groupedMockup.folder}</Text>
                {groupedMockup.files.map((file) => {
                  // @ts-ignore
                  const MockupFile = mockups[file].default;

                  return (
                    <Pressable
                      key={file}
                      onPress={() => setSelectedMockup(file as keyof T)}
                      android_ripple={{ borderless: false }}
                    >
                      <View style={styles.mockupButton}>
                        <Text>
                          {MockupFile.title || formatMockupName(file)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}
    </MockupContainer>
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
