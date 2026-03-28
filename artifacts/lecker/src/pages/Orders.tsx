import React from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { useGetMyOrders } from '@workspace/api-client-react';
import { Card } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
  new: { label: 'جديد', color: 'text-blue-400 bg-blue-400/10', icon: Clock },
  preparing: { label: 'قيد التجهيز', color: 'text-amber-400 bg-amber-400/10', icon: Package },
  ready: { label: 'جاهز للاستلام', color: 'text-primary bg-primary/10', icon: Package },
  delivered: { label: 'تم التسليم', color: 'text-emerald-400 bg-emerald-400/10', icon: CheckCircle2 },
  cancelled: { label: 'ملغي', color: 'text-destructive bg-destructive/10', icon: XCircle }
};

export default function Orders() {
  const { data: orders, isLoading } = useGetMyOrders();

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display text-gold-gradient mb-8">طلباتي</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-secondary/50 border-none" />)}
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">لا توجد طلبات سابقة</h2>
            <p className="text-muted-foreground">قم بإجراء طلبك الأول الآن لتراه هنا</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map(order => {
              const status = STATUS_MAP[order.status];
              const Icon = status.icon;
              return (
                <Card key={order.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        طلب رقم #{order.id} • {format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm')}
                      </div>
                      <div className="font-bold text-lg text-primary">{formatPrice(order.total)}</div>
                    </div>
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold w-fit ${status.color}`}>
                      <Icon className="w-4 h-4" /> {status.label}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          <span className="font-bold text-foreground ms-2">{item.quantity}x</span> {item.productNameAr}
                        </span>
                        <span className="font-medium">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
