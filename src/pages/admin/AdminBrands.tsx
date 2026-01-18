import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ZapOff, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  flash_sale_active: boolean;
  flash_sale_discount: number;
}

const AdminBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('name');
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const toggleFlashSale = async (brand: Brand) => {
    const { error } = await supabase
      .from('brands')
      .update({ 
        flash_sale_active: !brand.flash_sale_active,
        flash_sale_discount: brand.flash_sale_active ? 0 : 15
      })
      .eq('id', brand.id);

    if (error) {
      toast.error('Failed to toggle flash sale');
    } else {
      toast.success(
        brand.flash_sale_active 
          ? `Flash sale ended for ${brand.name}` 
          : `15% Flash sale activated for ${brand.name}!`
      );
      fetchBrands();
    }
  };

  const updateDiscount = async (brandId: string, discount: number) => {
    const { error } = await supabase
      .from('brands')
      .update({ flash_sale_discount: discount })
      .eq('id', brandId);

    if (error) {
      toast.error('Failed to update discount');
    } else {
      toast.success('Discount updated');
      fetchBrands();
    }
  };

  return (
    <AdminLayout title="Brands">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-secondary/50 rounded-2xl animate-pulse" />
          ))
        ) : (
          brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass-card p-6 relative overflow-hidden",
                brand.flash_sale_active && "ring-2 ring-primary"
              )}
            >
              {brand.flash_sale_active && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-pulse">
                  FLASH SALE
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl font-serif font-bold text-primary">
                  {brand.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground">/{brand.slug}</p>
                </div>
              </div>

              {brand.flash_sale_active && (
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Discount Percentage
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={brand.flash_sale_discount}
                      onChange={(e) => updateDiscount(brand.id, parseInt(e.target.value))}
                      className="bg-secondary/50 w-24"
                      min={1}
                      max={50}
                    />
                    <span className="flex items-center text-muted-foreground">%</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => toggleFlashSale(brand)}
                  variant={brand.flash_sale_active ? "destructive" : "default"}
                  className={cn(
                    "flex-1 gap-2",
                    !brand.flash_sale_active && "btn-luxury"
                  )}
                >
                  {brand.flash_sale_active ? (
                    <>
                      <ZapOff className="w-4 h-4" />
                      End Sale
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Flash Sale
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;
