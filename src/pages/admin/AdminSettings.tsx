import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Store, Bell, Shield, Palette, Save, Package, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WholesaleBenefit {
  icon: string;
  title: string;
  description: string;
}

interface WholesaleSettings {
  hero_title: string;
  hero_subtitle: string;
  benefits: WholesaleBenefit[];
  form_title: string;
  form_subtitle: string;
}

const AdminSettings = () => {
  const queryClient = useQueryClient();
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Smart Gear',
    storeEmail: 'info@smartgear.lk',
    storePhone: '+94 11 234 5678',
    storeAddress: 'Colombo, Sri Lanka',
    currency: 'Rs.',
    taxRate: 0
  });

  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    lowStockAlerts: true,
    newUserAlerts: false,
    emailDigest: true
  });

  const [appearance, setAppearance] = useState({
    darkMode: true,
    compactMode: false,
    showAnimations: true
  });

  const [wholesaleSettings, setWholesaleSettings] = useState<WholesaleSettings>({
    hero_title: 'Wholesale Partnership',
    hero_subtitle: '',
    benefits: [],
    form_title: 'Apply for Wholesale Account',
    form_subtitle: ''
  });

  // Fetch wholesale settings
  const { data: wholesaleData, isLoading: wholesaleLoading } = useQuery({
    queryKey: ['site-settings', 'wholesale_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'wholesale_page')
        .single();
      if (error) throw error;
      return data?.value as unknown as WholesaleSettings;
    }
  });

  useEffect(() => {
    if (wholesaleData) {
      setWholesaleSettings(wholesaleData);
    }
  }, [wholesaleData]);

  // Update wholesale settings mutation
  const updateWholesaleMutation = useMutation({
    mutationFn: async (settings: WholesaleSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: settings as any })
        .eq('key', 'wholesale_page');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'wholesale_page'] });
      toast.success('Wholesale settings saved!');
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  const handleSaveStore = () => {
    toast.success('Store settings saved');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSaveWholesale = () => {
    updateWholesaleMutation.mutate(wholesaleSettings);
  };

  const updateBenefit = (index: number, field: keyof WholesaleBenefit, value: string) => {
    setWholesaleSettings(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }));
  };

  const addBenefit = () => {
    setWholesaleSettings(prev => ({
      ...prev,
      benefits: [...prev.benefits, { icon: 'Package', title: '', description: '' }]
    }));
  };

  const removeBenefit = (index: number) => {
    setWholesaleSettings(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  return (
    <AdminLayout title="Settings">
      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="wholesale" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Wholesale</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Manage your store details and business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Address</Label>
                  <Input
                    id="storeAddress"
                    value={storeSettings.storeAddress}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Input
                    id="currency"
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveStore}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wholesale Settings */}
        <TabsContent value="wholesale">
          <Card>
            <CardHeader>
              <CardTitle>Wholesale Page Settings</CardTitle>
              <CardDescription>Customize the public wholesale inquiry page content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {wholesaleLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h4 className="font-medium">Hero Section</h4>
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle">Title</Label>
                      <Input
                        id="heroTitle"
                        value={wholesaleSettings.hero_title}
                        onChange={(e) => setWholesaleSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                        placeholder="Wholesale Partnership"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroSubtitle">Subtitle</Label>
                      <Textarea
                        id="heroSubtitle"
                        value={wholesaleSettings.hero_subtitle}
                        onChange={(e) => setWholesaleSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                        placeholder="Description of your wholesale program..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Benefits Section</h4>
                      <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Benefit
                      </Button>
                    </div>
                    {wholesaleSettings.benefits?.map((benefit, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Benefit {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBenefit(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Label>Icon (Percent, Package, Truck, Store)</Label>
                              <Input
                                value={benefit.icon}
                                onChange={(e) => updateBenefit(index, 'icon', e.target.value)}
                                placeholder="Percent"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={benefit.title}
                              onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                              placeholder="Benefit title"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={benefit.description}
                              onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                              placeholder="Benefit description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    {(!wholesaleSettings.benefits || wholesaleSettings.benefits.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No benefit cards yet. Click "Add Benefit" to create one.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Application Form</h4>
                    <div className="space-y-2">
                      <Label htmlFor="formTitle">Form Title</Label>
                      <Input
                        id="formTitle"
                        value={wholesaleSettings.form_title}
                        onChange={(e) => setWholesaleSettings(prev => ({ ...prev, form_title: e.target.value }))}
                        placeholder="Apply for Wholesale Account"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formSubtitle">Form Subtitle</Label>
                      <Textarea
                        id="formSubtitle"
                        value={wholesaleSettings.form_subtitle}
                        onChange={(e) => setWholesaleSettings(prev => ({ ...prev, form_subtitle: e.target.value }))}
                        placeholder="Instructions for applicants..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveWholesale} disabled={updateWholesaleMutation.isPending}>
                      {updateWholesaleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Wholesale Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                  </div>
                  <Switch
                    checked={notifications.orderNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, orderNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get alerted when products are running low</p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New User Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                  </div>
                  <Switch
                    checked={notifications.newUserAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newUserAlerts: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Email Digest</p>
                    <p className="text-sm text-muted-foreground">Receive a daily summary via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-3 max-w-md">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                    <Input type="password" placeholder="Confirm new password" />
                    <Button>Update Password</Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground mb-3">Manage your active login sessions</p>
                  <Button variant="destructive">Sign Out All Devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch
                    checked={appearance.darkMode}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, darkMode: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Animations</p>
                    <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch
                    checked={appearance.showAnimations}
                    onCheckedChange={(checked) => setAppearance({ ...appearance, showAnimations: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
