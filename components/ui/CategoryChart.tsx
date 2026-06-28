'use client';

import { Folders, ShoppingBag } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number; // total revenue
  quantity: number; // total quantity
}

interface CategoryChartProps {
  data: CategoryData[];
  title?: string;
  loading?: boolean;
}

export default function CategoryChart({ data = [], title = 'Sales by Category', loading = false }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl h-[320px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-background border border-border rounded-2xl p-6 shadow-xl h-[320px] flex flex-col items-center justify-center text-muted-foreground text-sm">
        <Folders className="w-10 h-10 text-muted-foreground/50 mb-2" />
        <p>No category data available.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((c) => c.value), 1);
  const totalCategoryRevenue = data.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="bg-background border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group h-full flex flex-col justify-between">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Folders className="w-5 h-5 text-cyan-500" />
            {title}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md">
            Total: ${totalCategoryRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="space-y-5">
          {data.slice(0, 5).map((category, idx) => {
            const percentage = (category.value / maxValue) * 100;
            const contribution = totalCategoryRevenue > 0 ? (category.value / totalCategoryRevenue) * 100 : 0;
            
            // Cycle colors for premium palette
            const gradients = [
              'from-emerald-500 to-cyan-500 shadow-emerald-500/10',
              'from-cyan-500 to-indigo-500 shadow-cyan-500/10',
              'from-indigo-500 to-purple-500 shadow-indigo-500/10',
              'from-amber-500 to-rose-500 shadow-amber-500/10',
              'from-rose-500 to-pink-500 shadow-rose-500/10'
            ];
            const borderColors = [
              'border-emerald-500/20',
              'border-cyan-500/20',
              'border-indigo-500/20',
              'border-amber-500/20',
              'border-rose-500/20'
            ];
            
            const gradientClass = gradients[idx % gradients.length];
            const borderClass = borderColors[idx % borderColors.length];

            return (
              <div key={category.name} className="space-y-1.5 group/item">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground group-hover/item:text-cyan-500 transition-colors">
                    {category.name}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    ${category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="relative w-full h-3 bg-muted border border-border rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out shadow-sm ${gradientClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground font-medium font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    {category.quantity} units sold
                  </span>
                  <span>{contribution.toFixed(1)}% of sales</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.length > 5 && (
        <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium italic">
          Showing top 5 categories
        </p>
      )}
    </div>
  );
}
