'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Cpu, 
  Users, 
  DollarSign, 
  Shield, 
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', color: '#374151' },
  { label: 'AI Studio', icon: Sparkles, href: '/admin/ai-studio', color: '#374151' },
  { label: 'Machines', icon: Gamepad2, href: '/admin/machines', color: '#374151' },
  { label: 'Tenants', icon: Users, href: '/admin/tenants', color: '#374151' },
  { label: 'Revenue', icon: DollarSign, href: '/admin/revenue', color: '#374151' },
  { label: 'Regulatory', icon: Shield, href: '/admin/regulatory', color: '#374151' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

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
        {children}
      </main>
    </div>
  );
}
