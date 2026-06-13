/**
 * Navigation Configuration
 *
 * Defines which pages appear in the site navigation and their display order.
 * Astro handles routing via the filesystem — this only controls nav menus.
 */

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

export const navItems: NavItem[] = [
  { label: 'HIC Dashboard', href: '/hic', order: 1 },
  { label: 'Engines', href: '/hic/engines', order: 2 },
  { label: 'Pipeline', href: '/hic/pipeline', order: 3 },
  { label: 'Evaluator', href: '/hic/evaluate', order: 4 },
  { label: 'Components', href: '/components', order: 5 },
  { label: 'Blog', href: '/blog', order: 6 },
  { label: 'About', href: '/about', order: 7 },
  { label: 'Contact', href: '/contact', order: 8 },
];

/**
 * Get navigation items sorted by order
 */
export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}
