import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';
import { getProducts } from '@/lib/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/types/product';

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const allProducts = await getProducts() as Product[];
      const newArrivals = allProducts.filter(p => p.new_arrival);
      setProducts(newArrivals);
      setLoading(false);
    };
    
    fetchNewArrivals();
  }, []);

  // Get the date of the most recent product for display
  const latestDate = products[0]?.created_at 
    ? new Date(products[0].created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Recently Added';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 md:p-12 mb-12"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Just Dropped</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                New Arrivals
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg">
                Discover the latest additions to our collection. Fresh tech accessories 
                that combine cutting-edge technology with premium design.
              </p>
              
              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Updated {latestDate}</span>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No new arrivals yet</h3>
              <p className="text-muted-foreground">
                Check back soon for the latest products!
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivals;
