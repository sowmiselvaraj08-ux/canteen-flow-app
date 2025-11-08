import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Cart } from "@/components/Cart";
import { LogOut, User, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import canteenLogo from "@/assets/canteen-logo.png";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  available: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CustomerDashboard = () => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole === "shop") {
      navigate("/shop");
      return;
    }

    fetchMenuItems();
  }, [user, userRole, navigate]);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("category");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  const filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing && existing.quantity > 1) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter(i => i.id !== item.id);
    });
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout", { state: { cart } });
  };

  const getItemQuantity = (itemId: string) => {
    return cart.find(i => i.id === itemId)?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={canteenLogo} alt="Canteen" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">Canteen</h1>
                <p className="text-sm text-muted-foreground">Order delicious food</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate("/orders")}>
                <History className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={signOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading menu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    onAdd={() => handleAddToCart(item)}
                    onRemove={() => handleRemoveFromCart(item)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Cart
              items={cart}
              onCheckout={handleCheckout}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
