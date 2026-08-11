'use client';

import { useState, useEffect } from 'react';
import { Plus, Folders, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface CategoryItem {
  _id: string;
  name: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!name.trim()) return;
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        toast.success(`Category "${name}" created successfully`);
        setName('');
        fetchCategories();
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

  const handleDelete = async (id: string, catName: string) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${catName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          title: 'Deleted!',
          text: `Category "${catName}" has been deleted.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchCategories();
      } else {
        Swal.fire({
          title: 'Cannot Delete Category',
          text: data.message || 'Failed to delete category.',
          icon: 'error',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong while deleting category.',
        icon: 'error',
      });
    } finally {
      setDeletingId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center gap-3 w-fit">
            <Folders className="w-8 h-8 text-indigo-600" />
            Categories
          </h1>
          <p className="text-muted-foreground mt-2">Manage product categories for your inventory</p>
        </div>
        <span className="bg-indigo-500/10 text-indigo-600 font-semibold px-3.5 py-1.5 rounded-full text-sm border border-indigo-500/20">
          Total: {cats.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form to add category */}
        <div className="bg-background border border-border rounded-2xl p-6 shadow-xl lg:col-span-1">
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
              disabled={submitLoading || !name.trim()}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {submitLoading ? 'Saving...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-card border-b border-border text-muted-foreground text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Category Name</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cats.map((cat) => (
                  <tr key={cat._id} className="hover:bg-card/60 transition-colors">
                    <td className="px-6 py-4 text-card-foreground font-semibold">{cat.name}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(cat.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deletingId === cat._id}
                        title="Delete Category"
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === cat._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {cats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      No categories found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
