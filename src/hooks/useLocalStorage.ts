import { useState, useEffect } from 'react';

// Generate unique session ID for this tab/instance
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID for this tab
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('tickrify_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('tickrify_session_id', sessionId);
  }
  return sessionId;
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  const sessionId = getSessionId();
  const sessionKey = `${key}_${sessionId}`;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // First try to get session-specific data
      const sessionItem = sessionStorage.getItem(sessionKey);
      if (sessionItem) {
        return JSON.parse(sessionItem, (key, value) => {
          // Convert timestamp strings back to Date objects
          if (key === 'timestamp' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
      }
      
      // Fallback to regular localStorage for backwards compatibility
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, (key, value) => {
        // Convert timestamp strings back to Date objects
        if (key === 'timestamp' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      }) : initialValue;
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Store in session storage for isolation
      sessionStorage.setItem(sessionKey, JSON.stringify(valueToStore));
      
      // Also store in localStorage as backup (but this will be session-specific)
      window.localStorage.setItem(sessionKey, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up session data when component unmounts
      try {
        // Keep the session data but mark it for cleanup
        const cleanupData = {
          ...storedValue,
          _cleanup: true,
          _timestamp: Date.now()
        };
        sessionStorage.setItem(sessionKey + '_cleanup', JSON.stringify(cleanupData));
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    };
  }, [sessionKey, storedValue]);

  return [storedValue, setValue] as const;
}