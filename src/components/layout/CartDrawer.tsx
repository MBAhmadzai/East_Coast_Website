import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] bg-charcoal-dark/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-card border-l border-border shadow-elevated"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Your Cart</h2>
                  <span className="text-sm text-muted-foreground">
                    ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-muted-foreground/70 mb-6">
                      Discover our premium tech accessories
                    </p>
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="btn-luxury"
                      asChild
                    >
                      <Link to="/shop">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="flex gap-4 p-4 bg-secondary/30 rounded-xl"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-charcoal-light flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.product.brand}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatPrice(item.product.price)} each
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-xl font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Shipping and taxes calculated at checkout
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full btn-luxury" onClick={() => setIsOpen(false)} asChild>
                      <Link to="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
