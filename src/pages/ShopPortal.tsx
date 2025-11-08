import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import canteenLogo from "@/assets/canteen-logo.png";

interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  notes: string | null;
  profiles?: {
    full_name: string;
  } | null;
}

const ShopPortal = () => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "shop" && userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchOrders();
    
    // Subscribe to realtime order updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "accepted", "preparing"])
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as any })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
      fetchOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-blue-500";
      case "preparing":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={canteenLogo} alt="Canteen" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">Shop Portal</h1>
                <p className="text-sm text-muted-foreground">Manage orders</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Active Orders</h2>
          <p className="text-muted-foreground">
            {orders.length} {orders.length === 1 ? "order" : "orders"} pending
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No active orders at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">Customer #{order.customer_id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-xl text-primary">₹{order.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-medium capitalize">{order.payment_method}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Ordered at</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    {order.status === "pending" && (
                      <>
                        <Button
                          onClick={() => updateOrderStatus(order.id, "accepted")}
                          className="w-full gradient-secondary"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Order
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateOrderStatus(order.id, "declined")}
                          className="w-full"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className="w-full"
                        variant="outline"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        className="w-full gradient-primary"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Ready
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopPortal;
