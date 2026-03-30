'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
     name: '', category: '', price: '', stock: '', threshold: '5'
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            threshold: Number(formData.threshold)
        }),
      });

      if (res.ok) {
        toast.success(`Product added successfully!`);
        setFormData({ name: '', category: formData.category, price: '', stock: '', threshold: '5' });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add product');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete "${name}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

    if (res.ok) {
      await Swal.fire({
        title: 'Deleted!',
        text: `Product "${name}" has been deleted.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData();
    } else {
      Swal.fire('Error!', 'Failed to delete product.', 'error');
    }
  } catch (err) {
    Swal.fire('Error!', 'Something went wrong.', 'error');
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-emerald-500 flex items-center gap-3 w-fit">
          <Package className="w-8 h-8 text-sky-600" />
          Products
        </h1>
        <p className="text-muted-foreground mt-2">Manage your inventory products and stock levels</p>
      </div>

      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl w-full">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-sky-500/50"
              placeholder="Product Name"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-sky-500/50"
            >
              <option value="" disabled>Select...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Price ($)</label>
            <input
              type="number"
              required min="0" step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-sky-500/50"
              placeholder="0.00"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Stock Vol.</label>
            <input
              type="number"
              required min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-sky-500/50"
              placeholder="0"
            />
          </div>
          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-black font-medium text-sm rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2 h-[38px] cursor-pointer"
            >
              {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {submitLoading ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-card border-b border-border text-muted-foreground text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Alert Threshold</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-card transition-colors">
                  <td className="px-6 py-4 text-card-foreground font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.category?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-muted-foreground">${p.price?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 flex items-center justify-center w-28 text-xs font-semibold rounded-full border ${
                          p.status === 'Active' 
                            ? p.stock <= p.threshold 
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {p.status === 'Active' && p.stock <= p.threshold ? 'Low Stock' : p.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{p.stock}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.threshold} units</td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No products found. Add a product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
