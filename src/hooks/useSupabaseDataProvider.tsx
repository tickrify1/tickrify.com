import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseData } from './useSupabaseData';

// Criar contexto
const SupabaseDataContext = createContext<ReturnType<typeof useSupabaseData> | undefined>(undefined);

// Provedor de contexto
export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const supabaseData = useSupabaseData();
  
  return (
    <SupabaseDataContext.Provider value={supabaseData}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

// Hook para consumir o contexto
export function useSupabaseDataContext() {
  const context = useContext(SupabaseDataContext);
  
  if (context === undefined) {
    throw new Error('useSupabaseDataContext deve ser usado dentro de um SupabaseDataProvider');
  }
  
  return context;
}


