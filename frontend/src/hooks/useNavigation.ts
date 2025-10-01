import { useState } from 'react';

export type PageType = 'dashboard' | 'signals' | 'success' | 'cancel' | 'landing' | 'custom-api';

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const navigateTo = (page: PageType) => {
    console.log('Navegando para:', page);
    setCurrentPage(page);
  };

  return {
    currentPage,
    navigateTo
  };
}