import React, { useState } from 'react';
import { useGetProducts } from '@workspace/api-client-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button, Card } from '@/components/ui-elements';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['الكل', 'بانكيك', 'كريب', 'وافل', 'بوظة', 'حلويات خاصة', 'مشروبات ساخنة', 'مشروبات باردة', 'وجبات خفيفة'];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  
  // Use generated hook
  const { data: products, isLoading } = useGetProducts(
    activeCategory === 'الكل' ? {} : { category: activeCategory }
  );

  const { addItem } = useCart();

  return (
    <CustomerLayout>
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
              className="text-4xl sm:text-6xl font-display text-gold-gradient mb-4 drop-shadow-lg"
            >
              حلاوة تذوب في الفم
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-muted-foreground"
            >
              اكتشف تشكيلتنا الفاخرة من الحلويات المصنوعة بحب وعناية فائقة.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-8 gap-3 no-scrollbar snap-x">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`snap-start whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                : 'bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <Card key={i} className="h-80 animate-pulse bg-secondary/50 border-none" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-foreground">لا توجد منتجات</h3>
          <p className="text-muted-foreground mt-2">عذراً، لا يوجد منتجات في هذا التصنيف حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="h-full flex flex-col group border-transparent hover:border-primary/50 transition-all duration-300">
                <div className="relative aspect-[4/3] bg-secondary/50 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ShoppingCart className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 end-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-primary border border-primary/20 shadow-lg">
                    {formatPrice(product.price)}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{product.nameAr}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{product.description}</p>
                  <Button 
                    onClick={() => addItem(product)} 
                    variant="outline" 
                    className="w-full mt-auto rounded-full border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20"
                  >
                    <Plus className="w-4 h-4 me-2" /> إضافة للسلة
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}
