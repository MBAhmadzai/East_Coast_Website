import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ShoppingBag } from 'lucide-react';
import { getOrders } from '@/lib/firestore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  name: string;
  brand: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500' },
};

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOrdersData = async () => {
      const data = await getOrders(user.uid);
      setOrders(data as Order[]);
      setLoading(false);
    };

    fetchOrdersData();
  }, [user, navigate]);

  const getStatusInfo = (status: OrderStatus) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container px-4 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Order History</h1>
            <p className="text-muted-foreground">Track and view your past orders</p>
          </motion.div>

          <div className="space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
              ))
            ) : orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-4"
              >
                <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  When you make a purchase, your orders will appear here
                </p>
                <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
              </motion.div>
            ) : (
              orders.map((order, i) => {
                const config = getStatusInfo(order.status);
                const StatusIcon = config.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", `${config.bg}/10`)}>
                          <StatusIcon className={cn("w-6 h-6", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                              `${config.bg}/10 ${config.color}`
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{formatPrice(Number(order.total))}</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(order.items) ? order.items.length : 0} items
                          </p>
                        </div>

                        <ChevronDown className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Items</h4>
                            <div className="space-y-2">
                              {Array.isArray(order.items) && order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-secondary/30 p-3 rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">{item.brand} × {item.quantity}</p>
                                  </div>
                                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                            <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                              {order.shipping_address}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Order Summary</h4>
                            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(Number(order.subtotal))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(Number(order.shipping_cost))}</span>
                              </div>
                              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(Number(order.total))}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistory;
