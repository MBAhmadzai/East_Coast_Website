import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { BrandPerformanceChart } from '@/components/admin/BrandPerformanceChart';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { formatPriceShort } from '@/lib/currency';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, lowStockRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('total'),
        supabase.from('products').select('id', { count: 'exact' }).lt('stock_count', 5)
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
        lowStockCount: lowStockRes.count || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      change: '+12%',
      positive: true
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: '+8%',
      positive: true
    },
    {
      title: 'Revenue',
      value: formatPriceShort(stats.totalRevenue),
      icon: DollarSign,
      change: '+23%',
      positive: true
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      change: stats.lowStockCount > 0 ? 'Needs attention' : 'All good',
      positive: stats.lowStockCount === 0
    }
  ];

  return (
    <AdminLayout title="Mission Control">
      {/* Low Stock Alert Banner */}
      <LowStockAlert />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {loading ? (
                    <span className="h-8 w-20 bg-secondary/50 rounded animate-pulse inline-block" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-sm ${stat.positive ? 'text-emerald-500' : 'text-amber-500'}`}>
              {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BrandPerformanceChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RecentOrders />
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
