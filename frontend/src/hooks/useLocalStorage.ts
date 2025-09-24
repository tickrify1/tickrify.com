import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, (key, value) => {
        // Convert timestamp strings back to Date objects
        if (key === 'timestamp' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      }) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      console.log(`💾 SALVANDO no localStorage [${key}]:`, valueToStore);
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      console.log(`✅ SALVO no localStorage [${key}] com sucesso`);
    } catch (error) {
      console.error(`❌ Erro salvando localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}