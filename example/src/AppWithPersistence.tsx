import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockupRoot } from '@jamsch/react-native-mockups';
import mockups from './mockups'; // your generated file

const STORAGE_KEY = 'MOCKUP_INITIAL_PATH';

export default function MockupApp() {
  const [initialPath, setInitialPath] = useState(null);

  // Load from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((path) => {
        setInitialPath(path || '');
      })
      .catch(() => setInitialPath(''));
  }, []);

  // Wait till we've tried to fetch from AsyncStorage
  if (typeof initialPath !== 'string') {
    return null;
  }

  // Render the view
  return (
    <MockupRoot
      mockups={mockups}
      onNavigate={(path) => {
        if (path) {
          AsyncStorage.setItem(STORAGE_KEY, path);
        } else {
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }}
      // Initial component to render
      initialPath={initialPath as keyof typeof mockups}
    />
  );
}
