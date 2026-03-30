'use client';

import { useState, useEffect } from 'react';
import { Plus, Folders, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = parseInt('0') ? [] : useState<any>(null); // weird hack to fix type assertion
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCats(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success(`Category "${name}" created successfully`);
        setName('');
        fetchCategories(); // reload list
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add category');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitLoading(false);
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Folders className="w-8 h-8 text-indigo-600" />
          Categories
        </h1>
        <p className="text-muted-foreground mt-2">Manage your product categories</p>
      </div>

      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="e.g. Electronics"
            />
          </div>
          <button
            type="submit"
            disabled={submitLoading || !name}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitLoading ? 'Saving...' : 'Create Category'}
          </button>
        </form>
      </div>

      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-card border-b border-border text-muted-foreground text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Category Name</th>
              <th className="px-6 py-4 font-medium text-right">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-300">
            {cats.map((cat: any) => (
              <tr key={cat._id} className="hover:bg-card transition-colors">
                <td className="px-6 py-4 text-card-foreground font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-muted-foreground text-right">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
