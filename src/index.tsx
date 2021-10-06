import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useWebsocket, useHandleBack } from './hooks';

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
  /** Websocket server path (e.g. "localhost:1337") */
  server?: string;
}

interface MockupContainerProps<T extends FileMap> extends MockupBaseProps<T> {
  children: (params: { navigate(mockup: keyof T): void }) => React.ReactNode;
}

export interface MockupRootRef {
  /** Navigates to a specific mockup (or back to the root view) */
  navigate(path: string | null): void;
}

function MockupContainer<T extends FileMap>(props: MockupContainerProps<T>) {
  const { mockups, initialPath, onNavigate, server, children } = props;

  const [selectedMockup, setSelectedMockup] = useState<keyof T | null>(
    initialPath || null
  );

  // If applicable, connect to the websocket server
  const { socket, connected } = useWebsocket(server || '', (message) => {
    if (message.type === 'NAVIGATE') {
      setSelectedMockup(message.payload as string);
    }
  });

  useEffect(() => {
    if (!connected || socket.current?.readyState !== WebSocket.OPEN) {
      return;
    }

    const sortedMockups = Object.keys(mockups)
      .map((mockup) => ({
        // @ts-ignore
        title: mockups[mockup]?.default?.title || formatMockupName(mockup),
        path: mockup,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    const action = JSON.stringify({
      type: 'UPDATE_STATE',
      payload: {
        path: selectedMockup,
        mockups: sortedMockups,
      },
    });
    socket.current?.send(action);
  }, [socket, connected, mockups, selectedMockup]);

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
      {children({ navigate: setSelectedMockup })}
    </ScrollView>
  );
}

export interface MockupRootProps<T extends FileMap> extends MockupBaseProps<T> {
  renderItem?: (params: {
    path: keyof T;
    title: string;
    navigate: (path: keyof T) => void;
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
      {({ navigate }) => (
        <View style={styles.container}>
          {sortedMockups.map(({ key, value }) => {
            // @ts-ignore
            const Mockup = value.default;
            const title = Mockup.title || formatMockupName(key);

            if (props.renderItem) {
              return props.renderItem({
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
      {({ navigate }) => (
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
                      onPress={() => navigate(file as keyof T)}
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
