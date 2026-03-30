'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Folders, ShoppingCart, RefreshCw, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Folders },
  { name: 'Restock Queue', href: '/restock', icon: RefreshCw },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Package className="text-zinc-950 w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-foreground">InventoryHub</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Aside */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col h-screen transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-hidden`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Package className="text-zinc-950 w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-foreground">InventoryHub</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg cursor-pointer">
             <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-muted text-emerald-600 font-medium shadow-md border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-600 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-muted-foreground group-hover:text-muted-foreground'}`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent rounded-xl transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Log Out
        </button>
      </div>
    </aside>
    </>
  );
}
