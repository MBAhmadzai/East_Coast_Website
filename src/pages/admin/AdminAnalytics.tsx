import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('7d');

  const { data: salesData } = useQuery({
    queryKey: ['analytics-sales', period],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .order('created_at', { ascending: true });
      
      // Group by date
      const grouped = (orders || []).reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += Number(order.total);
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { date: string; revenue: number; orders: number }>);
      
      return Object.values(grouped).slice(-7);
    }
  });

  const { data: categoryData } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: async () => {
      const { data: products } = await supabase
        .from('products')
        .select('category');
      
      const grouped = (products || []).reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }
  });

  const { data: topProducts } = useQuery({
    queryKey: ['analytics-top-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('order_items')
        .select('product_name, quantity, price_at_sale');
      
      const grouped = (data || []).reduce((acc, item) => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = { name: item.product_name, sales: 0, revenue: 0 };
        }
        acc[item.product_name].sales += item.quantity;
        acc[item.product_name].revenue += item.quantity * Number(item.price_at_sale);
        return acc;
      }, {} as Record<string, { name: string; sales: number; revenue: number }>);
      
      return Object.values(grouped).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { data: revenueData } = await supabase.from('orders').select('total');
      const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: totalBrands } = await supabase.from('brands').select('*', { count: 'exact', head: true });
      
      const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      
      return {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalProducts: totalProducts || 0,
        totalBrands: totalBrands || 0,
        avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0
      };
    }
  });

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-end">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">Rs. {stats?.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats?.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">Rs. {stats?.avgOrderValue.toFixed(0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{stats?.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(categoryData || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(topProducts || []).map((product, i) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rs. {product.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                ))}
                {(!topProducts || topProducts.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No sales data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
