'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Loader2, RefreshCw } from 'lucide-react';
import OrderModal from '@/components/ui/OrderModal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const StatusColors: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products') // need this for the modal
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setStatusLoading(id);
    try {
        const res = await fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            toast.success(`Order #${id.slice(-6).toUpperCase()} updated to ${newStatus}`);
            fetchData();
        } else {
            const data = await res.json();
            toast.error(data.message || 'Failed to update status');
        }
    } catch (err) {
        toast.error('Failed to communicate with server');
    } finally {
        setStatusLoading(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center gap-3 w-fit">
            <ShoppingCart className="w-8 h-8 text-emerald-600" />
            Orders
          </h1>
          <p className="text-muted-foreground mt-2">Manage customer orders and track fulfillment status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl px-5 py-2.5 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card border-b border-border text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total Price</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status / Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-card transition-colors">
                  <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                      #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-card-foreground font-medium">{order.customerName}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1 max-w-[200px]">
                        {order.products.map((p: any, idx: number) => (
                            <span key={idx} className="text-xs text-muted-foreground truncate">
                                {p.quantity}x {p.product?.name || 'Unknown Item'}
                            </span>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">${order.totalPrice?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${StatusColors[order.status]}`}>
                              {order.status}
                          </span>
                          
                          {/* Status Updater */}
                          {statusLoading === order._id ? (
                               <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                          ) : (
                              <select 
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  className="bg-card border border-border text-muted-foreground text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
                              >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                              </select>
                          )}
                      </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p>No orders currently exist. Create one to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          products={products}
          onOrderCreated={fetchData}
      />
    </div>
  );
}
