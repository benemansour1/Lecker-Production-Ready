import React, { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGetSettings, useUpdateSettings } from '@workspace/api-client-react';
import { Card, Button, Input } from '@/components/ui-elements';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Store, Truck } from 'lucide-react';

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  
  const { register, handleSubmit, reset, watch } = useForm();
  
  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSettings.mutateAsync({
        data: {
          isOpen: data.isOpen,
          deliveryEnabled: data.deliveryEnabled,
          deliveryFee: Number(data.deliveryFee),
          minOrderAmount: Number(data.minOrderAmount),
          storeName: data.storeName,
          storePhone: data.storePhone,
          storeAddress: data.storeAddress
        }
      });
      toast({ title: 'تم حفظ الإعدادات بنجاح' });
    } catch (err) {
      toast({ title: 'خطأ في الحفظ', variant: 'destructive' });
    }
  };

  const isOpen = watch('isOpen');
  const deliveryEnabled = watch('deliveryEnabled');

  if (isLoading) return <AdminLayout><Card className="h-96 animate-pulse bg-secondary/50 border-none" /></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gold-gradient mb-8">إعدادات المتجر</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <Card className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6"><Store className="text-primary"/> حالة المتجر</h2>
          
          <div className="space-y-6">
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${isOpen ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div>
                <p className="font-bold text-lg">المتجر مفتوح لاستقبال الطلبات</p>
                <p className="text-sm text-muted-foreground">عند الإغلاق لن يتمكن العملاء من إضافة طلبات جديدة</p>
              </div>
              <div className="relative inline-block w-14 h-8">
                <input type="checkbox" {...register('isOpen')} className="peer sr-only" />
                <div className="w-14 h-8 bg-secondary rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${isOpen ? 'start-1' : 'end-1'}`}></div>
              </div>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="اسم المتجر" {...register('storeName')} />
              <Input label="رقم الجوال للتواصل" {...register('storePhone')} dir="ltr" className="text-right" />
            </div>
            <Input label="العنوان الرئيسي" {...register('storeAddress')} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6"><Truck className="text-primary"/> إعدادات التوصيل</h2>
          
          <div className="space-y-6">
            <label className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${deliveryEnabled ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <div>
                <p className="font-bold text-lg">تفعيل خدمة التوصيل</p>
                <p className="text-sm text-muted-foreground">السماح للعملاء باختيار التوصيل للمنزل</p>
              </div>
              <div className="relative inline-block w-14 h-8">
                <input type="checkbox" {...register('deliveryEnabled')} className="peer sr-only" />
                <div className="w-14 h-8 bg-secondary rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${deliveryEnabled ? 'start-1' : 'end-1'}`}></div>
              </div>
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="رسوم التوصيل (₪)" type="number" step="0.01" {...register('deliveryFee')} disabled={!deliveryEnabled} />
              <Input label="الحد الأدنى للطلب (₪)" type="number" step="0.01" {...register('minOrderAmount')} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="w-full sm:w-auto px-12" isLoading={updateSettings.isPending}>
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
