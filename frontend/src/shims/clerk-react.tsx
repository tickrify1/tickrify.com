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

type OpenOptions = Record<string, unknown> | undefined;

export function useClerk(): {
  signOut: () => Promise<void>;
  openSignIn: (options?: OpenOptions) => Promise<void>;
  openSignUp: (options?: OpenOptions) => Promise<void>;
  user: null;
} {
  const signOut = async () => {};
  const openSignIn = async (_options?: OpenOptions) => {};
  const openSignUp = async (_options?: OpenOptions) => {};
  return { signOut, openSignIn, openSignUp, user: null };
}

export function SignInButton({ children }: { children?: React.ReactNode }) {
  const { openSignIn } = useClerk();
  return <button onClick={() => openSignIn()}>{children || 'Sign in'}</button>;
}

export function SignUpButton({ children }: { children?: React.ReactNode }) {
  const { openSignUp } = useClerk();
  return <button onClick={() => openSignUp()}>{children || 'Sign up'}</button>;
}


