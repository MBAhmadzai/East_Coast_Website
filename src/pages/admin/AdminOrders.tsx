import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: unknown;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    }
  };

  const deleteOrder = async (orderId: string) => {
    // First delete order items
    await supabase.from('order_items').delete().eq('order_id', orderId);
    
    // Then delete the order
    const { error } = await supabase.from('orders').delete().eq('id', orderId);

    if (error) {
      toast.error('Failed to delete order');
    } else {
      toast.success('Order deleted successfully');
      fetchOrders();
    }
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
          ))
        ) : orders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
          </div>
        ) : (
          orders.map((order, i) => {
            const config = getStatusConfig(order.status);
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
                {/* Order Header */}
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
                        <p className="font-semibold">{order.customer_name}</p>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          `${config.bg}/10 ${config.color}`
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_email} • {new Date(order.created_at).toLocaleDateString()}
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

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-4">
                      {/* Order Timeline */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updateStatus(order.id, option.value as OrderStatus)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                order.status === option.value
                                  ? `${option.bg} text-white`
                                  : `${option.bg}/10 ${option.color} hover:${option.bg}/20`
                              )}
                            >
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                          {order.shipping_address}
                        </p>
                      </div>

                      {/* Order Summary */}
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

                      {/* Delete Cancelled Orders */}
                      {order.status === 'cancelled' && (
                        <div className="pt-2 border-t border-border">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteOrder(order.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Cancelled Order
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
