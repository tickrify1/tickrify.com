import React from 'react';
import { Signal } from '../../types';

interface RecentSignalsProps {
  signals: Signal[];
}

export function RecentSignals({ signals }: RecentSignalsProps) {
  // Só mostrar se houver sinais reais
  if (signals.length === 0) {
    return null;
  }

  // Component implementation would go here when there are real signals
  return null;
}