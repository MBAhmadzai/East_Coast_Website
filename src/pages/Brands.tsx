import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBrands } from '@/lib/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_featured: boolean;
  flash_sale_active: boolean;
  flash_sale_discount: number;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const data = await getBrands();
      setBrands(data as Brand[]);
      setLoading(false);
    };
    
    fetchBrands();
  }, []);

  const featuredBrands = brands.filter(b => b.is_featured);
  const otherBrands = brands.filter(b => !b.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Brands</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover premium tech accessories from the world's leading brands
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Featured Brands */}
              {featuredBrands.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-12"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-display font-semibold">Featured Brands</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredBrands.map((brand, i) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link 
                          to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                          className="group block"
                        >
                          <div className="glass-card p-8 h-full relative overflow-hidden hover:border-primary/50 transition-all duration-300">
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl font-bold text-primary">
                                  {brand.name.charAt(0)}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    Featured
                                  </Badge>
                                  {brand.flash_sale_active && (
                                    <Badge variant="destructive">
                                      {brand.flash_sale_discount}% OFF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                {brand.name}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-4">
                                {brand.description || 'Premium quality tech accessories'}
                              </p>
                              
                              <div className="flex items-center text-sm text-primary font-medium">
                                Shop {brand.name}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* All Brands */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-display font-semibold mb-6">All Brands</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(otherBrands.length > 0 ? otherBrands : brands).map((brand, i) => (
                    <motion.div
                      key={brand.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link 
                        to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                        className="group block"
                      >
                        <div className="glass-card p-5 hover:border-primary/50 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                              {brand.name.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                                {brand.name}
                              </h3>
                              {brand.flash_sale_active && (
                                <span className="text-xs text-destructive font-medium">
                                  {brand.flash_sale_discount}% Flash Sale
                                </span>
                              )}
                            </div>
                            
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Brands;
