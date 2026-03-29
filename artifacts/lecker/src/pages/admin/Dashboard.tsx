import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetAdminStats } from '@workspace/api-client-react';
import { Card } from '@/components/ui-elements';
import { ShoppingBag, DollarSign, PackageOpen, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  const STAT_CARDS = [
    { title: 'إيرادات اليوم', value: formatPrice(stats?.todayRevenue || 0), icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'طلبات اليوم', value: stats?.todayOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'طلبات قيد الانتظار', value: stats?.pendingOrders || 0, icon: PackageOpen, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'إيرادات الشهر', value: formatPrice(stats?.monthRevenue || 0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold-gradient">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك في لوحة تحكم متجر لكر</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 relative overflow-hidden group">
              <div className={`absolute -end-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:bg-opacity-20 transition-all`} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-secondary/50 rounded animate-pulse mt-2" />
                  ) : (
                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Quick Actions / Info could go here */}
      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-4">إحصائيات إضافية</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">إجمالي المنتجات النشطة</span>
              <span className="font-bold text-lg">{stats?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">إجمالي الطلبات (تاريخياً)</span>
              <span className="font-bold text-lg">{stats?.totalOrders || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
