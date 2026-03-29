import React from 'react';
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
import { CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { CreateOrderRequestPaymentMethod } from '@workspace/api-client-react';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'الاسم مطلوب'),
  customerPhone: z.string().min(9, 'رقم الجوال غير صحيح'),
  deliveryAddress: z.string().min(5, 'عنوان التوصيل مطلوب'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'online'] as const)
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cash' }
  });

  const paymentMethod = watch('paymentMethod');

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutForm) => {
    try {
      await createOrder.mutateAsync({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          notes: data.notes,
          paymentMethod: data.paymentMethod as CreateOrderRequestPaymentMethod,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
        }
      });
      
      clearCart();
      toast({ title: 'تم إرسال الطلب بنجاح!', description: 'سنتواصل معك قريباً لتأكيد الطلب.', className: 'bg-primary text-primary-foreground border-none' });
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
            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4"><CheckCircle2 className="text-primary"/> معلومات التوصيل</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="الاسم الكامل" {...register('customerName')} error={errors.customerName?.message} placeholder="أدخل اسمك" />
                <Input label="رقم الجوال" {...register('customerPhone')} error={errors.customerPhone?.message} placeholder="05XXXXXXXX" dir="ltr" className="text-right" />
              </div>
              
              <Input label="عنوان التوصيل بالتفصيل" {...register('deliveryAddress')} error={errors.deliveryAddress?.message} placeholder="المدينة، الحي، الشارع، رقم المبنى" />
              
              <Input label="ملاحظات إضافية (اختياري)" {...register('notes')} placeholder="أي تفاصيل إضافية للطلب أو التوصيل" />
            </Card>

            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4"><CreditCard className="text-primary"/> طريقة الدفع</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setValue('paymentMethod', 'cash')}
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className={`p-3 rounded-xl ${paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}><Banknote className="w-6 h-6"/></div>
                  <div><p className="font-bold">الدفع عند الاستلام</p><p className="text-sm text-muted-foreground">نقداً أو شبكة</p></div>
                </div>

                <div 
                  onClick={() => setValue('paymentMethod', 'online')}
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <div className={`p-3 rounded-xl ${paymentMethod === 'online' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}><CreditCard className="w-6 h-6"/></div>
                  <div><p className="font-bold">دفع إلكتروني</p><p className="text-sm text-muted-foreground">بطاقة ائتمانية / مدى</p></div>
                </div>
              </div>
              {errors.paymentMethod && <p className="text-destructive text-sm">{errors.paymentMethod.message}</p>}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border/50">طلبك</h3>
              
              <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pe-2">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{item.quantity}x</span> {item.product.nameAr}
                    </span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4 space-y-4 mb-6">
                <div className="flex justify-between font-bold text-xl text-primary">
                  <span>الإجمالي</span>
                  <span>{formatPrice(getCartTotal())}</span>
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
