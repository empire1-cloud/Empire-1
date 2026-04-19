'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Shield, 
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles,
  Music,
  LogOut
} from 'lucide-react';

import { clearSla113Session, getSla113AdminRole, getSla113AdminToken } from '@/lib/sla113Auth';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', color: '#374151' },
  { label: 'AI Studio', icon: Sparkles, href: '/admin/ai-studio', color: '#374151' },
  { label: 'Stem Deck', icon: Music, href: '/admin/stem-deck', color: '#374151' },
  { label: 'Machines', icon: Gamepad2, href: '/admin/machines', color: '#374151' },
  { label: 'Tenants', icon: Users, href: '/admin/tenants', color: '#374151' },
  { label: 'Revenue', icon: DollarSign, href: '/admin/revenue', color: '#374151' },
  { label: 'Regulatory', icon: Shield, href: '/admin/regulatory', color: '#374151' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState('');
  const [hasSession, setHasSession] = useState(true);

  useEffect(() => {
    const token = getSla113AdminToken();
    const sessionRole = getSla113AdminRole();

    setHasSession(Boolean(token));
    setRole(sessionRole.replace(/_/g, ' '));

    if (!token) {
      router.replace('/admin/login');
    }
  }, [router]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearSla113Session();
    router.push('/admin/login');
    router.refresh();
  };

  if (!hasSession) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-gray-200">
          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          {!collapsed && <span className="ml-2 text-sm font-semibold text-gray-900">SLA113</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-md text-sm transition-colors
                ${isActive(item.href) 
                  ? 'bg-gray-100 text-gray-900 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Active Role</p>
            <p className="mt-1 text-sm font-medium text-gray-900 capitalize">{role}</p>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-white"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 border-t border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500">SLA113 Admin Host</p>
              <p className="mt-1 text-sm text-gray-900">Dedicated operator console for sla113.southernlifestyle.org</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-700">
              Session Active
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
