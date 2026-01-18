import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Image, 
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
  Store
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Brands', path: '/admin/brands', icon: Tag },
  { name: 'Wholesale', path: '/admin/wholesale', icon: Store },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Media', path: '/admin/media', icon: Image },
  { name: 'Users', path: '/admin/users', icon: Users, adminOnly: true },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-charcoal-dark/80 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-border">
            <Link to="/" className={cn("flex items-center gap-2", collapsed && "justify-center")}>
              {!collapsed && (
                <span className="text-xl font-serif font-bold text-gradient-gold">Smart Gear</span>
              )}
              {collapsed && (
                <span className="text-2xl font-serif font-bold text-gradient-gold">SG</span>
              )}
            </Link>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors hidden lg:block"
            >
              <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-border">
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user?.email?.[0].toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Staff'}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className={cn(
                "mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-card/50 backdrop-blur-sm border-b border-border flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
