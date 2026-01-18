import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';
import { Plus, Users, Package, TrendingUp, Mail, Phone, Building2, Percent, Edit, Trash2 } from 'lucide-react';

// Define types inline since they may not be in generated types yet
interface WholesaleCustomer {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  discount_percentage: number;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WholesalePricing {
  id: string;
  product_id: string;
  min_quantity: number;
  price_per_unit: number;
  created_at: string;
  updated_at: string;
  products?: { name: string; price: number } | null;
}

const AdminWholesale = () => {
  const queryClient = useQueryClient();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<WholesaleCustomer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    discount_percentage: 10,
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    notes: ''
  });
  const [pricingForm, setPricingForm] = useState({
    product_id: '',
    min_quantity: 10,
    price_per_unit: 0
  });

  // Fetch wholesale customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['wholesale-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wholesale_customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WholesaleCustomer[];
    }
  });

  // Fetch wholesale pricing
  const { data: pricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ['wholesale-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wholesale_pricing')
        .select('*, products(name, price)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch products for pricing dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-wholesale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Create/Update customer mutation
  const customerMutation = useMutation({
    mutationFn: async (data: typeof customerForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('wholesale_customers')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wholesale_customers')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-customers'] });
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      resetCustomerForm();
      toast.success(editingCustomer ? 'Customer updated!' : 'Customer added!');
    },
    onError: (error) => {
      toast.error('Failed to save customer: ' + error.message);
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wholesale_customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-customers'] });
      toast.success('Customer deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete customer: ' + error.message);
    }
  });

  // Create pricing mutation
  const pricingMutation = useMutation({
    mutationFn: async (data: typeof pricingForm) => {
      const { error } = await supabase
        .from('wholesale_pricing')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-pricing'] });
      setIsPricingModalOpen(false);
      resetPricingForm();
      toast.success('Pricing rule added!');
    },
    onError: (error) => {
      toast.error('Failed to add pricing: ' + error.message);
    }
  });

  // Delete pricing mutation
  const deletePricingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wholesale_pricing')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-pricing'] });
      toast.success('Pricing rule deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete pricing: ' + error.message);
    }
  });

  const resetCustomerForm = () => {
    setCustomerForm({
      business_name: '',
      contact_name: '',
      email: '',
      phone: '',
      discount_percentage: 10,
      status: 'pending',
      notes: ''
    });
  };

  const resetPricingForm = () => {
    setPricingForm({
      product_id: '',
      min_quantity: 10,
      price_per_unit: 0
    });
  };

  const handleEditCustomer = (customer: WholesaleCustomer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      business_name: customer.business_name,
      contact_name: customer.contact_name || '',
      email: customer.email,
      phone: customer.phone || '',
      discount_percentage: customer.discount_percentage,
      status: customer.status,
      notes: customer.notes || ''
    });
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = () => {
    if (!customerForm.business_name || !customerForm.email) {
      toast.error('Business name and email are required');
      return;
    }
    customerMutation.mutate(editingCustomer ? { ...customerForm, id: editingCustomer.id } : customerForm);
  };

  const handlePricingSubmit = () => {
    if (!pricingForm.product_id || pricingForm.price_per_unit <= 0) {
      toast.error('Product and price are required');
      return;
    }
    pricingMutation.mutate(pricingForm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  const approvedCustomers = customers.filter(c => c.status === 'approved').length;
  const pendingCustomers = customers.filter(c => c.status === 'pending').length;

  return (
    <AdminLayout title="Wholesale Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Building2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pricing Rules</p>
                  <p className="text-2xl font-bold">{pricing.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Wholesale Customers</h2>
                <p className="text-sm text-muted-foreground">Manage your wholesale business accounts</p>
              </div>
              <Dialog open={isCustomerModalOpen} onOpenChange={(open) => {
                setIsCustomerModalOpen(open);
                if (!open) {
                  setEditingCustomer(null);
                  resetCustomerForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Wholesale Customer'}</DialogTitle>
                    <DialogDescription>
                      {editingCustomer ? 'Update customer details' : 'Add a new wholesale business account'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Business Name *</Label>
                      <Input
                        value={customerForm.business_name}
                        onChange={(e) => setCustomerForm(f => ({ ...f, business_name: e.target.value }))}
                        placeholder="Company Ltd."
                      />
                    </div>
                    <div>
                      <Label>Contact Name</Label>
                      <Input
                        value={customerForm.contact_name}
                        onChange={(e) => setCustomerForm(f => ({ ...f, contact_name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="business@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                    <div>
                      <Label>Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={customerForm.discount_percentage}
                          onChange={(e) => setCustomerForm(f => ({ ...f, discount_percentage: Number(e.target.value) }))}
                        />
                        <Percent className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={customerForm.status}
                        onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                          setCustomerForm(f => ({ ...f, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={customerForm.notes}
                        onChange={(e) => setCustomerForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Any additional notes..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCustomerSubmit} disabled={customerMutation.isPending}>
                      {customerMutation.isPending ? 'Saving...' : editingCustomer ? 'Update' : 'Add Customer'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No wholesale customers yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.business_name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {customer.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{customer.contact_name || '-'}</p>
                              {customer.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {customer.phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.discount_percentage}%</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            {new Date(customer.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteCustomerMutation.mutate(customer.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Wholesale Pricing</h2>
                <p className="text-sm text-muted-foreground">Set bulk pricing rules for products</p>
              </div>
              <Dialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pricing Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Pricing Rule</DialogTitle>
                    <DialogDescription>
                      Set a wholesale price for bulk orders
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Product *</Label>
                      <Select
                        value={pricingForm.product_id}
                        onValueChange={(value) => setPricingForm(f => ({ ...f, product_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({formatPrice(product.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Minimum Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={pricingForm.min_quantity}
                        onChange={(e) => setPricingForm(f => ({ ...f, min_quantity: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Price Per Unit (Rs.)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={pricingForm.price_per_unit}
                        onChange={(e) => setPricingForm(f => ({ ...f, price_per_unit: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPricingModalOpen(false)}>Cancel</Button>
                    <Button onClick={handlePricingSubmit} disabled={pricingMutation.isPending}>
                      {pricingMutation.isPending ? 'Adding...' : 'Add Rule'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Min Quantity</TableHead>
                      <TableHead>Wholesale Price</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : pricing.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pricing rules yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      pricing.map((rule: any) => {
                        const savings = rule.products ? 
                          ((rule.products.price - rule.price_per_unit) / rule.products.price * 100).toFixed(0) : 0;
                        return (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">
                              {rule.products?.name || 'Unknown Product'}
                            </TableCell>
                            <TableCell>
                              {rule.products ? formatPrice(rule.products.price) : '-'}
                            </TableCell>
                            <TableCell>{rule.min_quantity}+ units</TableCell>
                            <TableCell className="text-primary font-semibold">
                              {formatPrice(rule.price_per_unit)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-green-500 border-green-500/30">
                                {savings}% off
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deletePricingMutation.mutate(rule.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWholesale;
