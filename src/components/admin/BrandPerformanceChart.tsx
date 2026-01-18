import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { CURRENCY_SYMBOL } from '@/lib/currency';

interface BrandData {
  name: string;
  products: number;
  revenue: number;
}

export const BrandPerformanceChart = () => {
  const [data, setData] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandData = async () => {
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name');

      const { data: products } = await supabase
        .from('products')
        .select('brand, price, stock_count');

      if (brands && products) {
        const brandStats = brands.map(brand => {
          const brandProducts = products.filter(p => 
            p.brand?.toLowerCase() === brand.name.toLowerCase()
          );
          return {
            name: brand.name,
            products: brandProducts.length,
            revenue: brandProducts.reduce((sum, p) => sum + Number(p.price) * 10, 0) // Simulated sales
          };
        });
        setData(brandStats);
      }
      setLoading(false);
    };

    fetchBrandData();
  }, []);

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold mb-4">Brand Performance</h3>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              name={`Revenue (${CURRENCY_SYMBOL})`}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
