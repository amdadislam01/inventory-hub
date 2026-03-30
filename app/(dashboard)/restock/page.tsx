'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Package, Loader2, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RestockPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockStock, setRestockStock] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLowStockProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const all = await res.json();
        const lowStock = all.filter((p: any) => p.stock < p.threshold).sort((a: any, b: any) => a.stock - b.stock);
        setProducts(lowStock);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const handleRestock = async (id: string, currentStock: number) => {
    const amount = restockStock[id] || 0;
    if (amount <= 0) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: currentStock + amount })
      });
      if (res.ok) {
         toast.success(`Restocked ${amount} units successfully!`);
         setRestockStock({ ...restockStock, [id]: 0 });
         fetchLowStockProducts();
      } else {
         toast.error('Failed to restock item.');
      }
    } catch (err) {
      toast.error('Something went wrong.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-rose-500 flex items-center gap-3 w-fit">
          <RefreshCw className="w-8 h-8 text-amber-600" />
          Restock Queue
        </h1>
        <p className="text-muted-foreground mt-2">Prioritized list of items that are low or out of stock.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => {
            const isCritical = p.stock === 0;
            const percentage = p.stock / p.threshold;
            
            return (
              <div key={p._id} className="bg-background border border-border flex flex-col justify-between rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />
                
                <div className="flex items-start justify-between">
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isCritical ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {isCritical ? 'Out of Stock (Priority: High)' : 'Low Stock (Priority: Medium)'}
                        </span>
                        <h3 className="text-xl font-bold text-foreground mt-3">{p.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{p.category?.name}</p>
                    </div>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-border pt-6">
                    <div>
                        <p className="text-muted-foreground text-sm">Current Stock</p>
                        <p className={`text-2xl font-bold mt-1 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                            {p.stock} <span className="text-muted-foreground text-sm font-normal">/ {p.threshold} min</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={restockStock[p._id] || ''}
                            onChange={(e) => setRestockStock({ ...restockStock, [p._id]: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-card border border-border text-card-foreground text-sm rounded-lg px-2 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-center"
                        />
                        <button
                            onClick={() => handleRestock(p._id, p.stock)}
                            disabled={updatingId === p._id || !restockStock[p._id]}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg p-2 transition-colors flex items-center justify-center"
                            title="Restock Item"
                        >
                            {updatingId === p._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
              </div>
            );
        })}

        {products.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-border rounded-2xl bg-background">
               <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
               <p className="text-muted-foreground mt-2">No products are running low on stock at the moment.</p>
            </div>
        )}
      </div>
    </div>
  );
}
