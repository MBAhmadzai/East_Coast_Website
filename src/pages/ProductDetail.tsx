import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { getProductById } from '@/lib/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await getProductById(id!);
      return data as Product | null;
    },
    enabled: !!id,
  });

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-secondary animate-pulse rounded-xl" />
            <div className="space-y-4">
              <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
              <div className="h-10 w-3/4 bg-secondary animate-pulse rounded" />
              <div className="h-8 w-48 bg-secondary animate-pulse rounded" />
              <div className="h-32 bg-secondary animate-pulse rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-charcoal-light">
              <motion.img
                key={selectedImageIndex}
                src={product.images?.[selectedImageIndex] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.new_arrival && (
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    NEW
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <Link
                to={`/brands`}
                className="text-sm font-medium text-primary uppercase tracking-wider hover:underline"
              >
                {product.brand}
              </Link>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-semibold rounded">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.stock_count > 0 ? (
                <span className={cn(
                  "text-sm font-medium",
                  product.stock_count < 10 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {product.stock_count < 10 
                    ? `⚠️ Only ${product.stock_count} left in stock` 
                    : `✓ In Stock (${product.stock_count} available)`}
                </span>
              ) : (
                <span className="text-sm font-medium text-destructive">✕ Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                  disabled={quantity >= product.stock_count}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_count === 0}
                className="flex-1 h-12 gap-2"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </Button>
              
              <Button variant="outline" size="lg" className="h-12 w-12 p-0">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders {CURRENCY_SYMBOL} 15,000+</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Warranty</p>
                  <p className="text-xs text-muted-foreground">1 Year Coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-Day Policy</p>
                </div>
              </div>
            </div>

            {/* Category & Compatibility */}
            <div className="space-y-3 pt-6 border-t border-border">
              <p className="text-sm">
                <span className="text-muted-foreground">Category:</span>{' '}
                <span className="font-medium">{product.category}</span>
              </p>
              {product.compatibility && product.compatibility.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Compatible with:</span>{' '}
                  <span className="font-medium capitalize">
                    {product.compatibility.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
