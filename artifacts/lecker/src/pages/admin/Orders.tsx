import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminGetOrders, useUpdateOrderStatus } from '@workspace/api-client-react';
import { Card, Button } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { UpdateOrderStatusRequestStatus } from '@workspace/api-client-react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'جديد' },
  { value: 'preparing', label: 'قيد التجهيز' },
  { value: 'ready', label: 'جاهز للاستلام' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' }
];

export default function AdminOrders() {
  const { data: orders, refetch } = useAdminGetOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id: orderId,
        data: { status: status as UpdateOrderStatusRequestStatus }
      });
      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب بنجاح' });
      refetch();
    } catch (err) {
      toast({ title: 'خطأ', description: 'فشل التحديث', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-display text-gold-gradient mb-8">إدارة الطلبات</h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground">
                <th className="p-4 font-medium">رقم الطلب</th>
                <th className="p-4 font-medium">العميل</th>
                <th className="p-4 font-medium">التاريخ</th>
                <th className="p-4 font-medium">الإجمالي</th>
                <th className="p-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders?.map(order => (
                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-bold text-primary">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-bold">{order.customerName || 'غير محدد'}</div>
                    <div className="text-sm text-muted-foreground" dir="ltr">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 text-sm">{format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm')}</td>
                  <td className="p-4 font-bold">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <select
                      className="bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatus.isPending}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
