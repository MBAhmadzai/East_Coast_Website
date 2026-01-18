import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { getProducts, getBrands, getCategories } from '@/lib/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const compatibilityOptions = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'samsung', label: 'Samsung' },
  { value: 'android', label: 'Android' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'universal', label: 'Universal' },
];

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');
  
  // Mobile filter sheet
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    compatibility: true,
    price: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, brandsData, categoriesData] = await Promise.all([
        getProducts(),
        getBrands(),
        getCategories(),
      ]);
      
      setProducts(productsData as Product[]);
      setBrands(brandsData as Brand[]);
      setCategories(categoriesData as Category[]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }
    
    // Compatibility filter
    if (selectedCompatibility.length > 0) {
      result = result.filter(p => 
        p.compatibility?.some(c => selectedCompatibility.includes(c))
      );
    }
    
    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        break;
    }
    
    return result;
  }, [products, searchQuery, selectedBrands, selectedCategories, selectedCompatibility, priceRange, sortBy]);

  const toggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedCompatibility([]);
    setPriceRange([0, 1000]);
    setSortBy('newest');
  };

  const activeFiltersCount = selectedBrands.length + selectedCategories.length + selectedCompatibility.length;

  const FilterSection = ({ title, isOpen, onToggle, children }: { 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium hover:text-primary transition-colors">
        {title}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  const FiltersContent = () => (
    <div className="space-y-1">
      {/* Categories */}
      <FilterSection 
        title="Categories" 
        isOpen={openSections.categories}
        onToggle={() => setOpenSections(s => ({ ...s, categories: !s.categories }))}
      >
        {categories.map(category => (
          <label key={category.id} className="flex items-center gap-3 py-1.5 cursor-pointer group">
            <Checkbox
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={() => toggleFilter(category.name, selectedCategories, setSelectedCategories)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {category.name}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Brands */}
      <FilterSection 
        title="Brands" 
        isOpen={openSections.brands}
        onToggle={() => setOpenSections(s => ({ ...s, brands: !s.brands }))}
      >
        {brands.map(brand => (
          <label key={brand.id} className="flex items-center gap-3 py-1.5 cursor-pointer group">
            <Checkbox
              checked={selectedBrands.includes(brand.name)}
              onCheckedChange={() => toggleFilter(brand.name, selectedBrands, setSelectedBrands)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {brand.name}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Compatibility */}
      <FilterSection 
        title="Device Compatibility" 
        isOpen={openSections.compatibility}
        onToggle={() => setOpenSections(s => ({ ...s, compatibility: !s.compatibility }))}
      >
        {compatibilityOptions.map(option => (
          <label key={option.value} className="flex items-center gap-3 py-1.5 cursor-pointer group">
            <Checkbox
              checked={selectedCompatibility.includes(option.value)}
              onCheckedChange={() => toggleFilter(option.value, selectedCompatibility, setSelectedCompatibility)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={clearAllFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Shop All Products</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${filteredProducts.length} products`}
            </p>
          </motion.div>

          {/* Search and Sort Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </motion.div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block w-64 shrink-0"
            >
              <div className="sticky top-24 glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <FiltersContent />
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-secondary/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, i) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
