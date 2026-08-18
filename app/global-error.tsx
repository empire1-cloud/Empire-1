'use client';

/**
 * Root-level error boundary (Next.js App Router convention).
 *
 * app/error.tsx only catches errors below the root layout — if the root
 * layout itself throws, Next.js falls back to this file instead, which
 * must render its own <html>/<body> since it replaces the root layout
 * entirely. Without this, a root-layout-level crash produces a genuinely
 * blank browser tab with no fallback UI at all.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: '2rem',
          textAlign: 'center',
          background: '#050505',
          color: '#f2f2f4',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Something went wrong.
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
      </body>
    </html>
  );
}
