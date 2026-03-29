import React, { useEffect, useRef, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminGetOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import { Card, Button } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { UpdateOrderStatusRequestStatus } from '@workspace/api-client-react';
import { Package, Phone, MapPin, CreditCard, Clock, ChevronDown, ChevronUp, Truck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'new', label: 'جديد', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'preparing', label: 'قيد التجهيز', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'ready', label: 'جاهز للاستلام', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: 'delivered', label: 'تم التسليم', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-destructive/20 text-destructive border-destructive/30' },
];

const PAYMENT_LABELS: Record<string, string> = {
  cash: '💵 كاش / عند الاستلام',
  card: '💳 بطاقة ائتمانية',
  online: '📱 دفع إلكتروني',
};

function playOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const times = [0, 0.2, 0.4];
    times.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.5, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.15);
    });
  } catch {}
}

export default function AdminOrders() {
  const { data: orders, refetch } = useAdminGetOrders();
  const updateStatus = useUpdateOrderStatus();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const prevCountRef = useRef<number | null>(null);
  const soundEnabledRef = useRef(false);

  // Enable sound on first click anywhere
  useEffect(() => {
    const enable = () => { soundEnabledRef.current = true; };
    window.addEventListener('click', enable, { once: true });
    return () => window.removeEventListener('click', enable);
  }, []);

  // Poll for new orders every 30 seconds and play sound on new order
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await refetch();
      const newCount = result.data?.filter(o => o.status === 'new').length ?? 0;
      if (prevCountRef.current !== null && newCount > prevCountRef.current) {
        if (soundEnabledRef.current) playOrderSound();
        toast({
          title: '🔔 طلب جديد وصل!',
          description: `لديك ${newCount} طلبات جديدة بانتظار المعالجة`,
        });
      }
      prevCountRef.current = newCount;
    }, 30000);

    // Set initial count
    if (orders && prevCountRef.current === null) {
      prevCountRef.current = orders.filter(o => o.status === 'new').length;
    }

    return () => clearInterval(interval);
  }, [orders, refetch]);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: orderId,
        data: { status: status as UpdateOrderStatusRequestStatus }
      });
      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب وإشعار العميل' });
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
  };

  const filtered = orders?.filter(o =>
    statusFilter === 'all' ? true : o.status === statusFilter
  ) ?? [];

  const newCount = orders?.filter(o => o.status === 'new').length ?? 0;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gold-gradient">إدارة الطلبات</h1>
          {newCount > 0 && (
            <p className="text-amber-400 font-medium mt-1 animate-pulse">
              🔔 {newCount} طلب جديد بانتظار المعالجة
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ value: 'all', label: 'الكل' }, ...STATUS_OPTIONS].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                statusFilter === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد طلبات</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const statusObj = STATUS_OPTIONS.find(s => s.value === order.status);
            const isExpanded = expandedId === order.id;
            const items = (order.items as any[]) || [];
            const isDelivery = (order as any).deliveryType === 'delivery' || !!(order as any).deliveryAddress;

            return (
              <Card key={order.id} className={cn(
                'overflow-hidden border transition-all',
                order.status === 'new' ? 'border-amber-500/40 shadow-amber-500/10 shadow-lg' : 'border-border/50'
              )}>
                {/* Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Order ID + Status */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl font-bold text-primary">#{order.id}</div>
                      <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statusObj?.color)}>
                        {statusObj?.label}
                      </span>
                      {order.status === 'new' && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full animate-pulse font-medium">جديد!</span>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(order.createdAt), 'dd/MM/yyyy - HH:mm', { locale: arSA })}
                    </div>

                    {/* Status selector */}
                    <select
                      className="bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary min-w-36"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatus.isPending}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer info row */}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-muted-foreground">👤</span>
                      {order.customerName || 'غير محدد'}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground" dir="ltr">
                      <Phone className="w-3.5 h-3.5" />
                      {order.customerPhone}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {isDelivery ? <Truck className="w-3.5 h-3.5 text-blue-400" /> : <Store className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className={isDelivery ? 'text-blue-400' : 'text-emerald-400'}>
                        {isDelivery ? 'توصيل' : 'استلام شخصي'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                    </div>
                    <div className="font-bold text-primary text-base mr-auto">{formatPrice(order.total)}</div>
                  </div>

                  {/* Expand button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? 'إخفاء التفاصيل' : 'عرض تفاصيل الطلب'}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-secondary/20 p-4 sm:p-5 space-y-4">
                    {/* Items */}
                    <div>
                      <h3 className="font-bold mb-3 text-sm text-muted-foreground">🛍 المنتجات المطلوبة</h3>
                      <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-card/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                                {item.quantity}x
                              </span>
                              <span className="font-medium">{item.productNameAr || item.productName}</span>
                            </div>
                            <span className="text-primary font-bold">{formatPrice(item.subtotal || item.price * item.quantity)}</span>
                          </div>
                        ))}

                        {/* Delivery fee indicator */}
                        {isDelivery && (
                          <div className="flex items-center justify-between bg-blue-500/10 rounded-xl px-4 py-3">
                            <span className="text-blue-400 text-sm flex items-center gap-2">
                              <Truck className="w-4 h-4" /> رسوم التوصيل
                            </span>
                            <span className="text-blue-400 font-bold">₪15</span>
                          </div>
                        )}

                        <div className="flex justify-between border-t border-border/50 pt-3 font-bold text-lg">
                          <span>الإجمالي</span>
                          <span className="text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {isDelivery && (order as any).deliveryAddress && (
                      <div className="flex items-start gap-2 bg-card/50 rounded-xl p-4">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">عنوان التوصيل</p>
                          <p className="font-medium">{(order as any).deliveryAddress}</p>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">ملاحظات العميل</p>
                          <p className="font-medium text-foreground">{order.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
