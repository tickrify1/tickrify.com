import React from 'react';

// Minimal development shim for @clerk/clerk-react so the app can run without a Clerk key
// This simulates a signed-out state by default.

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  // In dev shim, default to signed-out to avoid showing gated content unintentionally
  return null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function UserButton() {
  return null;
}

export function useUser(): { isLoaded: boolean; isSignedIn: boolean; user: null } {
  return { isLoaded: true, isSignedIn: false, user: null };
}


