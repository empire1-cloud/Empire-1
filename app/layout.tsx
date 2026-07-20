import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export function generateMetadata(): Metadata {
  const host = headers().get('host') || 'empire1.cloud';
  const cleanHost = host.split(':')[0].toLowerCase() || 'empire1.cloud';
  const isLocalHost = cleanHost === 'localhost' || cleanHost === '127.0.0.1';
  const origin = isLocalHost ? 'http://localhost:3000' : `https://${cleanHost}`;

  return {
    metadataBase: new URL(origin),
    title: 'Empire One',
    description: 'Empire One',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
