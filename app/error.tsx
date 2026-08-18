'use client';

import { useEffect } from 'react';

/**
 * Segment-level error boundary (Next.js App Router convention).
 *
 * Catches any render/runtime error thrown by a page or its children and
 * shows a visible fallback instead of leaving a logged-out visitor on a
 * blank/black screen. Does not fix the underlying error — just guarantees
 * it's never silent.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        background: '#050505',
        color: '#f2f2f4',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
        Something went wrong loading this page.
      </h1>
      <p style={{ opacity: 0.65, marginBottom: '1.5rem', maxWidth: '32rem' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.6rem 1.2rem',
          borderRadius: '0.4rem',
          border: '1px solid #e8b923',
          background: 'transparent',
          color: '#e8b923',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try again
      </button>
    </div>
  );
}
