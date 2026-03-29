import React, { useState } from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { useCart } from '@/hooks/use-cart';
import { Button, Input, Card } from '@/components/ui-elements';
import { useCreateOrder } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, CreditCard, Banknote, Truck, Store } from 'lucide-react';
import { CreateOrderRequestPaymentMethod } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';

const DELIVERY_FEE = 15;

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'الاسم مطلوب'),
  customerPhone: z.string().min(9, 'رقم الجوال غير صحيح'),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'online'] as const)
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cash' }
  });

  const paymentMethod = watch('paymentMethod');
  const cartTotal = getCartTotal();
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = cartTotal + deliveryFee;

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (deliveryType === 'delivery' && !data.deliveryAddress) {
      toast({ title: 'خطأ', description: 'عنوان التوصيل مطلوب للتوصيل', variant: 'destructive' });
      return;
    }

    try {
      await createOrder.mutateAsync({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: deliveryType === 'delivery' ? data.deliveryAddress : null,
          deliveryType: deliveryType as any,
          notes: data.notes,
          paymentMethod: data.paymentMethod as CreateOrderRequestPaymentMethod,
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            variantName: i.variant?.nameAr,
            variantPrice: i.variant?.price,
          }))
        }
      });

      clearCart();
      toast({
        title: '✅ تم إرسال الطلب بنجاح!',
        description: 'سنتواصل معك قريباً لتأكيد الطلب.',
        className: 'bg-primary text-primary-foreground border-none'
      });
      setLocation('/orders');
    } catch (err: any) {
      toast({ title: 'حدث خطأ', description: err.message || 'فشل في إرسال الطلب', variant: 'destructive' });
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-gradient mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery or Pickup */}
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <Truck className="text-primary w-5 h-5" /> طريقة الاستلام
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setDeliveryType('delivery')}
                  className={cn(
                    'cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all',
                    deliveryType === 'delivery' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('p-3 rounded-xl', deliveryType === 'delivery' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">توصيل للمنزل</p>
                    <p className="text-sm text-muted-foreground">رسوم التوصيل {formatPrice(DELIVERY_FEE)}</p>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryType('pickup')}
                  className={cn(
                    'cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all',
                    deliveryType === 'pickup' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('p-3 rounded-xl', deliveryType === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">استلام من المحل</p>
                    <p className="text-sm text-muted-foreground">مجاناً</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <CheckCircle2 className="text-primary w-5 h-5" /> معلومات الطلب
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="الاسم الكامل" {...register('customerName')} error={errors.customerName?.message} placeholder="أدخل اسمك" />
                <Input label="رقم الجوال" {...register('customerPhone')} error={errors.customerPhone?.message} placeholder="05XXXXXXXX" dir="ltr" className="text-right" />
              </div>

              {deliveryType === 'delivery' && (
                <Input
                  label="عنوان التوصيل بالتفصيل"
                  {...register('deliveryAddress')}
                  placeholder="المدينة، الحي، الشارع، رقم المبنى"
                  required
                />
              )}

              <Input label="ملاحظات إضافية (اختياري)" {...register('notes')} placeholder="أي تفاصيل إضافية للطلب" />
            </Card>

            {/* Payment */}
            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <CreditCard className="text-primary w-5 h-5" /> طريقة الدفع
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setValue('paymentMethod', 'cash')}
                  className={cn('cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all', paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}
                >
                  <div className={cn('p-3 rounded-xl', paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div><p className="font-bold">الدفع عند الاستلام</p><p className="text-sm text-muted-foreground">نقداً أو شبكة</p></div>
                </div>

                <div
                  onClick={() => setValue('paymentMethod', 'online')}
                  className={cn('cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all', paymentMethod === 'online' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}
                >
                  <div className={cn('p-3 rounded-xl', paymentMethod === 'online' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div><p className="font-bold">دفع إلكتروني</p><p className="text-sm text-muted-foreground">بطاقة / مدى</p></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border/50">ملخص طلبك</h3>

              <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto pe-1">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{item.quantity}x</span> {item.product.nameAr}
                    </span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={deliveryType === 'delivery' ? 'text-blue-400' : 'text-emerald-400'}>
                    {deliveryType === 'delivery' ? '🚚 رسوم التوصيل' : '🏪 استلام شخصي'}
                  </span>
                  <span className={deliveryType === 'delivery' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {deliveryType === 'delivery' ? `+${formatPrice(DELIVERY_FEE)}` : 'مجاني'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl text-primary border-t border-border/50 pt-3">
                  <span>الإجمالي</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full text-lg py-4" isLoading={createOrder.isPending}>
                تأكيد الطلب
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
