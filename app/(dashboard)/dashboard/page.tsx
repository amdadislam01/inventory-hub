'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import ActivityFeed from '@/components/ui/ActivityFeed';
import { ShoppingCart, CheckCircle, AlertTriangle, DollarSign, Package } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, logsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/logs'),
        ]);

        if (dashRes.ok) setData(await dashRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-20 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">Welcome back. Here is what&apos;s happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Today"
          value={`$${data?.revenueToday?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Orders Today"
          value={data?.totalOrdersToday || 0}
          icon={ShoppingCart}
          color="indigo"
        />
        <StatCard
          title="Pending Orders"
          value={data?.pendingOrders || 0}
          icon={CheckCircle}
          color="cyan"
        />
        <StatCard
          title="Low Stock Items"
          value={data?.lowStockCount || 0}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Top Products
          </h2>
          <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-card border-b border-border text-muted-foreground text-sm">
                  <tr>
                    <th className="px-4 md:px-6 py-4 font-medium">Product Name</th>
                    <th className="px-4 md:px-6 py-4 font-medium hidden sm:table-cell">Status</th>
                    <th className="px-4 md:px-6 py-4 font-medium text-right sm:text-left">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-300">
                  {data?.productSummary?.map((product: any) => (
                    <tr key={product._id} className="hover:bg-card transition-colors">
                      <td className="px-4 md:px-6 py-4 text-card-foreground font-medium">{product.name}</td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          product.status === 'Active' 
                            ? product.stock < product.threshold 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {product.status === 'Active' && product.stock < product.threshold ? 'Low Stock' : product.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground text-right sm:text-left">{product.stock} units</td>
                    </tr>
                  ))}
                  {(!data?.productSummary || data.productSummary.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            Recent Activity
          </h2>
          <div className="bg-background border border-border shadow-xl rounded-2xl p-6">
            <ActivityFeed logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

// temp fix for lucide-react Activity icon error
import { Activity } from 'lucide-react';
