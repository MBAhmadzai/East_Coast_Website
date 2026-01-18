import { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/currency';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  processing: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  shipped: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  delivered: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setOrders(data);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-4">Recent Orders</h3>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                  <StatusIcon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatPrice(Number(order.total))}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
