import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import SignalTab from './SignalTab';

describe('SignalTab', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ signal: 'BUY', confidence: 0.9, reason: 'test', timestamp: new Date().toISOString() })
    });
  });

  it('renders BUY badge from API', async () => {
    render(<SignalTab />);
    await waitFor(() => expect(screen.getByText(/BUY/)).toBeInTheDocument());
    expect(screen.getByText(/Confidence/)).toBeInTheDocument();
  });
});


