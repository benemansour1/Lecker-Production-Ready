import React, { useState } from 'react';
import { useGetProducts, Product } from '@workspace/api-client-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button, Card } from '@/components/ui-elements';
import { useCart, ProductVariant } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { Plus, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CATEGORIES = ['الكل', 'بانكيك', 'كريب', 'وافل', 'بوظة', 'فشافيش', 'أكل', 'مشروبات ساخنة', 'مشروبات باردة', 'بيرا', 'حلويات خاصة'];

const CATEGORY_EMOJI: Record<string, string> = {
  'بانكيك': '🥞',
  'كريب': '🫔',
  'وافل': '🧇',
  'بوظة': '🍨',
  'فشافيش': '🍿',
  'أكل': '🍔',
  'مشروبات ساخنة': '☕',
  'مشروبات باردة': '🧋',
  'بيرا': '🍺',
  'حلويات خاصة': '🍫',
};

// Variant selector dialog
function VariantDialog({
  product,
  onSelect,
  onClose,
}: {
  product: Product;
  onSelect: (variant: ProductVariant) => void;
  onClose: () => void;
}) {
  const variants = (product.variants as ProductVariant[] | null) ?? [];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold">{product.nameAr}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-5">اختر الحجم أو النوع</p>
          <div className="space-y-3">
            {variants.map((v) => (
              <button
                key={v.nameAr}
                onClick={() => onSelect(v)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-border hover:border-primary bg-secondary/30 hover:bg-primary/10 transition-all group"
              >
                <span className="font-bold group-hover:text-primary">{v.nameAr}</span>
                <span className="font-bold text-primary text-lg">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useGetProducts(
    activeCategory === 'الكل' ? {} : { category: activeCategory }
  );

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    const variants = (product.variants as ProductVariant[] | null) ?? [];
    if (variants.length > 0) {
      setVariantProduct(product);
    } else {
      addItem(product);
      toast({ title: '✓ تمت الإضافة للسلة', description: product.nameAr, duration: 2000 });
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!variantProduct) return;
    addItem(variantProduct, 1, variant);
    toast({
      title: '✓ تمت الإضافة للسلة',
      description: `${variantProduct.nameAr} — ${variant.nameAr}`,
      duration: 2000,
    });
    setVariantProduct(null);
  };

  return (
    <CustomerLayout>
      {/* Variant Selector Dialog */}
      {variantProduct && (
        <VariantDialog
          product={variantProduct}
          onSelect={handleVariantSelect}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 h-64 sm:h-80 shadow-2xl shadow-black/50 border border-border/50 group">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center p-8 sm:p-12">
          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-gold-gradient mb-4 drop-shadow-lg"
            >
              لحظة حلوة تستحق ✨
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-muted-foreground mb-2"
            >
              من يد الشيف مباشرةً لقلبك، بأجود المكونات الطازجة 🍫
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-primary/70 font-medium tracking-wide"
            >
              بانكيك &nbsp;•&nbsp; كريب &nbsp;•&nbsp; وافل &nbsp;•&nbsp; بوظة &nbsp;•&nbsp; حلويات خاصة
            </motion.p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-3 no-scrollbar snap-x">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2',
              activeCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                : 'bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary'
            )}
          >
            {CATEGORY_EMOJI[cat] && <span>{CATEGORY_EMOJI[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <Card key={i} className="h-60 animate-pulse bg-secondary/50 border-none" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-foreground">لا توجد منتجات</h3>
          <p className="text-muted-foreground mt-2">عذراً، لا يوجد منتجات في هذا التصنيف حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.map((product, idx) => {
            const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <Card className="h-full flex flex-col group border-transparent hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/80 to-background/60">
                        <span className="text-5xl drop-shadow-lg select-none">
                          {CATEGORY_EMOJI[product.category ?? ''] ?? '🍬'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 end-2 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-primary border border-primary/20 shadow">
                      {hasVariants ? `من ${formatPrice((product.variants as any[])[0].price)}` : formatPrice(product.price)}
                    </div>
                    {hasVariants && (
                      <div className="absolute top-2 start-2 bg-amber-500/90 px-2 py-0.5 rounded-full text-xs font-bold text-background">
                        اختر حجم
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">{product.nameAr}</h3>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {hasVariants ? 'اختر وأضف' : 'إضافة للسلة'}
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
