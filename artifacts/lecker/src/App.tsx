import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminRevenueDaily from "./pages/admin/RevenueDaily";
import AdminRevenueMonthly from "./pages/admin/RevenueMonthly";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/orders" component={Orders} />
      
      {/* Admin Routes - secret path */}
      <Route path="/manage" component={AdminLogin} />
      <Route path="/manage/login" component={AdminLogin} />
      <Route path="/manage/dashboard" component={AdminDashboard} />
      <Route path="/manage/orders" component={AdminOrders} />
      <Route path="/manage/products" component={AdminProducts} />
      <Route path="/manage/revenue/daily" component={AdminRevenueDaily} />
      <Route path="/manage/revenue/monthly" component={AdminRevenueMonthly} />
      <Route path="/manage/settings" component={AdminSettings} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Ensure RTL on load
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
