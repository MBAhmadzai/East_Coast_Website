import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { ProductModal } from '@/components/admin/ProductModal';
import { BulkUploadModal } from '@/components/admin/BulkUploadModal';
import { formatPrice } from '@/lib/currency';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all');

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*').order('created_at', { ascending: false });
    
    if (filter === 'low-stock') {
      query = query.lt('stock_count', 5);
    }
    
    const { data } = await query;
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Products">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant={filter === 'low-stock' ? 'default' : 'outline'}
            onClick={() => setFilter(filter === 'low-stock' ? 'all' : 'low-stock')}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Low Stock
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowBulkModal(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button 
            onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            className="btn-luxury gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Brand</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td colSpan={6} className="p-4">
                      <div className="h-12 bg-secondary/50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-charcoal-light overflow-hidden">
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{product.brand}</td>
                    <td className="p-4">
                      <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                      {product.original_price && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={product.stock_count < 5 ? 'text-amber-500 font-semibold' : ''}>
                        {product.stock_count}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.stock_count > 0 ? (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setShowProductModal(true); }}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        product={editingProduct}
        onSuccess={fetchProducts}
      />
      <BulkUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchProducts}
      />
    </AdminLayout>
  );
};

export default AdminProducts;
