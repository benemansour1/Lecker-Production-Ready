import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from '@workspace/api-client-react';
import { Card, Button, Input, Dialog } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

export default function AdminProducts() {
  const { data: products, refetch } = useAdminGetProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const openCreate = () => {
    setEditingProduct(null);
    reset({ isActive: true, sortOrder: 0, category: 'بانكيك' });
    setIsDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    reset(p);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.nameAr || data.name, // Fallback if name is omitted in form
        nameAr: data.nameAr,
        category: data.category,
        price: Number(data.price),
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        sortOrder: Number(data.sortOrder)
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: payload });
        toast({ title: 'تم التحديث بنجاح' });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: 'تمت الإضافة بنجاح' });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteProduct.mutateAsync({ id });
        toast({ title: 'تم الحذف' });
        refetch();
      } catch (err) {
        toast({ title: 'خطأ', variant: 'destructive' });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-display text-gold-gradient">المنتجات</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-5 h-5"/> إضافة منتج</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground">
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">التصنيف</th>
                <th className="p-4 font-medium">السعر</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products?.map(p => (
                <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.nameAr} className="w-12 h-12 rounded-lg object-cover bg-secondary" />
                    ) : <div className="w-12 h-12 rounded-lg bg-secondary" />}
                    <span className="font-bold">{p.nameAr}</span>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 font-bold text-primary">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'}`}>
                      {p.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input label="اسم المنتج (بالعربية)" {...register('nameAr')} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="السعر (شيكل)" type="number" step="0.01" {...register('price')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground ms-1">التصنيف</label>
              <select {...register('category')} className="bg-input/50 border-2 border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none">
                {['بانكيك', 'كريب', 'وافل', 'بوظة', 'حلويات خاصة', 'مشروبات ساخنة', 'مشروبات باردة', 'وجبات خفيفة'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Input label="الوصف" {...register('description')} />
          <Input label="رابط الصورة (URL)" {...register('imageUrl')} dir="ltr" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ترتيب العرض" type="number" {...register('sortOrder')} />
            <label className="flex items-center gap-3 mt-8 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-5 h-5 accent-primary" />
              <span>المنتج نشط ومتاح للطلب</span>
            </label>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-border/50">
            <Button type="submit" className="flex-1" isLoading={createProduct.isPending || updateProduct.isPending}>حفظ</Button>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
