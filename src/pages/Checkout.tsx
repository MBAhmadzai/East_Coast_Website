import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight,
  ArrowLeft,
  Package,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const shippingCost = subtotal > 15000 ? 0 : 500;
  const total = subtotal + shippingCost;

  const steps = [
    { id: 'cart', label: 'Cart', icon: ShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle2 },
  ];

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateShipping = () => {
    const required = ['fullName', 'email', 'address', 'city', 'postalCode', 'country'];
    for (const field of required) {
      if (!shippingInfo[field as keyof ShippingInfo]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) {
      setCurrentStep('shipping');
      return;
    }

    setIsProcessing(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_brand: item.product.brand,
        quantity: item.quantity,
        price_at_sale: item.product.price,
      }));

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.uid || null,
          customer_name: shippingInfo.fullName,
          customer_email: shippingInfo.email,
          shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
          items: orderItems,
          subtotal,
          shipping_cost: shippingCost,
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      const orderItemsInsert = orderItems.map(item => ({
        order_id: data.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_brand: item.product_brand,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
      }));

      await supabase.from('order_items').insert(orderItemsInsert);

      setOrderId(data.id);
      clearCart();
      setCurrentStep('confirmation');
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = step.id === currentStep;
        const isPast = steps.findIndex(s => s.id === currentStep) > index;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isActive ? 'bg-primary text-primary-foreground' : ''}
                ${isPast ? 'bg-primary/20 text-primary' : ''}
                ${!isActive && !isPast ? 'bg-muted text-muted-foreground' : ''}
              `}>
                <StepIcon className="w-5 h-5" />
              </div>
              <span className={`hidden sm:block text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderCartStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold">Review Your Cart</h2>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                <img
                  src={item.product.images?.[0] || '/placeholder.svg'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                  <p className="text-primary font-semibold">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeItem(item.product.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full btn-luxury"
            onClick={() => setCurrentStep('shipping')}
          >
            Continue to Shipping
          </Button>
        </>
      )}
    </motion.div>
  );

  const renderShippingStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentStep('cart')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-semibold">Shipping Information</h2>
      </div>
      
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              value={shippingInfo.fullName}
              onChange={handleShippingChange}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={shippingInfo.email}
              onChange={handleShippingChange}
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={shippingInfo.phone}
            onChange={handleShippingChange}
            placeholder="+1 234 567 8900"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            name="address"
            value={shippingInfo.address}
            onChange={handleShippingChange}
            placeholder="123 Main Street"
          />
        </div>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingChange}
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={shippingInfo.postalCode}
              onChange={handleShippingChange}
              placeholder="10001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              name="country"
              value={shippingInfo.country}
              onChange={handleShippingChange}
              placeholder="United States"
            />
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full btn-luxury"
        onClick={() => {
          if (validateShipping()) {
            setCurrentStep('payment');
          }
        }}
      >
        Continue to Payment
      </Button>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentStep('shipping')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-semibold">Payment</h2>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Secure payment processing</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              className="font-mono"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          💡 This is a demo checkout. No real payment will be processed.
        </p>
      </div>
      
      <Button 
        className="w-full btn-luxury"
        onClick={handlePlaceOrder}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
      </Button>
    </motion.div>
  );

  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-primary" />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>
      
      {orderId && (
        <div className="bg-card rounded-xl border border-border p-4 inline-block">
          <p className="text-sm text-muted-foreground">Order ID</p>
          <p className="font-mono text-sm">{orderId}</p>
        </div>
      )}
      
      <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <span className="font-medium">What's Next?</span>
        </div>
        <p className="text-sm text-muted-foreground text-left">
          You'll receive an email confirmation at {shippingInfo.email} with your order details and tracking information once your order ships.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Continue Shopping
        </Button>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </motion.div>
  );

  const renderOrderSummary = () => (
    <div className="bg-card rounded-2xl border border-border p-6 h-fit sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.product.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
        </div>
        {subtotal < 15000 && (
          <p className="text-xs text-muted-foreground">
            Add {formatPrice(15000 - subtotal)} more for free shipping
          </p>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span className="text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Checkout</h1>
          
          {renderStepIndicator()}
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === 'cart' && renderCartStep()}
                {currentStep === 'shipping' && renderShippingStep()}
                {currentStep === 'payment' && renderPaymentStep()}
                {currentStep === 'confirmation' && renderConfirmationStep()}
              </AnimatePresence>
            </div>
            
            {currentStep !== 'confirmation' && items.length > 0 && (
              <div className="lg:col-span-1">
                {renderOrderSummary()}
              </div>
            )}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
