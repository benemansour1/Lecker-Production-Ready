import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, PackageOpen, Settings, LogOut, BarChart3, CalendarDays } from 'lucide-react';
import { useGetMe, useLogout } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'لوحة القيادة', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'الطلبات', href: '/admin/orders', icon: ShoppingBag },
  { name: 'المنتجات', href: '/admin/products', icon: PackageOpen },
  { name: 'الإيرادات اليومية', href: '/admin/revenue/daily', icon: CalendarDays },
  { name: 'الإيرادات الشهرية', href: '/admin/revenue/monthly', icon: BarChart3 },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const logoutMutation = useLogout();

  // Guard
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-72 hidden lg:flex flex-col border-e border-border/50 glass-panel border-y-0 rounded-none z-10 relative">
        <div className="p-6 flex items-center justify-center border-b border-border/50">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <img src={`${import.meta.env.BASE_URL}images/lecker-logo.png`} alt="Lecker" className="h-16 w-16 object-contain drop-shadow-lg" />
            <span className="font-display text-2xl text-gold-gradient">إدارة لكر</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive ? "bg-primary/10 text-primary border border-primary/20 shadow-inner" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border/50 glass-panel flex items-center justify-between px-4 z-20">
          <span className="font-display text-xl text-primary">إدارة لكر</span>
          <button onClick={handleLogout} className="p-2 text-destructive"><LogOut className="w-5 h-5"/></button>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
