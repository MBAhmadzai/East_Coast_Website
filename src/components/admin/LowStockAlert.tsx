import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LowStockProduct {
  id: string;
  name: string;
  stock_count: number;
  brand: string;
}

export const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchLowStock = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, stock_count, brand')
        .lt('stock_count', 5)
        .order('stock_count', { ascending: true })
        .limit(5);
      
      if (data) {
        setLowStockProducts(data);
      }
    };

    fetchLowStock();
  }, []);

  if (lowStockProducts.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-500 mb-2">Low Stock Alert</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {lowStockProducts.map((product) => (
                <span
                  key={product.id}
                  className="px-3 py-1 bg-secondary/50 rounded-full text-sm"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-amber-500 ml-2">({product.stock_count} left)</span>
                </span>
              ))}
            </div>
            <Link 
              to="/admin/products?filter=low-stock"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all low stock items <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
