import { SITE_URL, GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION } from 'astro:env/server';

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  /**
   * Branding configuration
   * Logo files: Replace SVGs in src/assets/branding/
   * Favicon: Replace in public/favicon.svg
   */
  branding: {
    /** Logo alt text for accessibility */
    logo: {
      alt: string;
    };
    /** Favicon path (lives in public/) */
    favicon: {
      svg: string;
    };
    /** Theme colors for manifest and browser UI */
    colors: {
      /** Browser toolbar color (hex) */
      themeColor: string;
      /** PWA splash screen background (hex) */
      backgroundColor: string;
    };
  };
}

const siteConfig: SiteConfig = {
  name: 'Empire-1',
  description: 'Empire-1 AI Ecosystem — 245+ engines across gaming, music, payments, cultural intelligence, and creator economy.',
  url: SITE_URL || 'https://empire1.cloud',
  ogImage: '/og-default.png',
  author: 'Empire-1',
  email: 'hello@empire1.cloud',
  socialLinks: [
    'https://github.com/shiestybizz113-cell',
  ],
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    bing: BING_SITE_VERIFICATION,
  },
  branding: {
    logo: {
      alt: 'Empire-1',
    },
    favicon: {
      svg: '/favicon.svg',
    },
    colors: {
      themeColor: '#FF2975',
      backgroundColor: '#0A0A0F',
    },
  },
};

export default siteConfig;
