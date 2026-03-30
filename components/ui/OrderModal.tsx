import { X, Search, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

// client component for creating new orders
export default function OrderModal({ isOpen, onClose, products, onOrderCreated }: any) {
  const [customerName, setCustomerName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const availableProducts = useMemo(() => {
    return products.filter((p: any) => p.status === 'Active' && p.stock > 0);
  }, [products]);

  const addProductToOrder = (product: any) => {
    if (selectedProducts.find((p) => p.product === product._id)) {
       toast.error('This product is already added to the order.');
       return;
    }
    setSelectedProducts([...selectedProducts, { product: product._id, name: product.name, price: product.price, quantity: 1, maxStock: product.stock }]);
  };

  const removeProductFromOrder = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product !== id));
  };

  const updateQuantity = (id: string, qty: number, maxStock: number) => {
    if (qty > maxStock) {
        toast.error(`Only ${maxStock} items available in stock for this product.`);
        return;
    }
    setSelectedProducts(
        selectedProducts.map((p) => p.product === id ? { ...p, quantity: Math.max(1, qty) } : p)
    );
  };

  const handleSubmit = async () => {
    if (!customerName || selectedProducts.length === 0) {
        toast.error('Please enter a customer name and at least one product.');
        return;
    }

    setLoading(true);

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName,
                products: selectedProducts.map(p => ({ product: p.product, quantity: p.quantity }))
            })
        });

        if (res.ok) {
            toast.success('Order created successfully!');
            onOrderCreated(); // trigger a data refresh
            onClose();
        } else {
            const data = await res.json();
            toast.error(data.message || 'Failed to create order');
        }
    } catch (err) {
        toast.error('Something went wrong. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = selectedProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Create New Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
               <X className="w-5 h-5" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Customer Name</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Enter customer name..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Available Products Sidebar */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Available Products</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto bg-card p-2 border border-border rounded-xl">
                        {availableProducts.map((p: any) => (
                            <div key={p._id} className="flex flex-col gap-1 p-3 bg-card hover:bg-muted rounded-lg cursor-pointer transition-colors border border-border" onClick={() => addProductToOrder(p)}>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-card-foreground">{p.name}</span>
                                    <span className="text-emerald-600 text-sm font-medium">${p.price}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Products Area */}
                <div className="space-y-3 flex flex-col h-full">
                    <h3 className="text-sm font-medium text-muted-foreground">Order Items</h3>
                    <div className="flex-1 space-y-2 bg-card p-2 border border-border border-dashed rounded-xl max-h-[300px] overflow-y-auto">
                        {selectedProducts.length === 0 ? (
                            <div className="h-full flex items-center justify-center p-8 text-muted-foreground text-sm">
                                Select products to add to order
                            </div>
                        ) : (
                            selectedProducts.map((p) => (
                                <div key={p.product} className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-card-foreground truncate">{p.name}</p>
                                        <p className="text-xs text-emerald-600">${p.price * p.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max={p.maxStock}
                                            value={p.quantity}
                                            onChange={(e) => updateQuantity(p.product, parseInt(e.target.value) || 1, p.maxStock)}
                                            className="w-16 bg-card border border-border rounded p-1 text-center text-sm text-foreground"
                                        />
                                        <button onClick={() => removeProductFromOrder(p.product)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-border bg-card flex items-center justify-between">
            <div>
               <p className="text-sm text-muted-foreground">Total Amount</p>
               <p className="text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 text-muted-foreground hover:bg-muted rounded-xl font-medium transition-colors">
                    Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading || selectedProducts.length === 0 || !customerName}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Order
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
