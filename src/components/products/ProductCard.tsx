import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { addItem } = useCart();

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="product-card group"
      onMouseEnter={() => {
        setIsHovered(true);
        if (product.images.length > 1) setImageIndex(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-charcoal-light">
        <Link to={`/product/${product.id}`}>
          <motion.img
            key={imageIndex}
            src={product.images[imageIndex] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
          />
        </Link>

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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4 flex gap-2"
        >
          <button
            onClick={() => addItem(product)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:shadow-gold-glow transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-secondary/80 backdrop-blur-sm text-foreground rounded-lg hover:bg-secondary transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="w-12 h-12 flex items-center justify-center bg-secondary/80 backdrop-blur-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        <Link to={`/product/${product.id}`}>
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3">
          {product.stock_count > 0 ? (
            <span className={cn(
              "text-xs font-medium",
              product.stock_count < 10 ? "text-amber-500" : "text-emerald-500"
            )}>
              {product.stock_count < 10 ? `Only ${product.stock_count} left` : 'In Stock'}
            </span>
          ) : (
            <span className="text-xs font-medium text-destructive">Out of Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
