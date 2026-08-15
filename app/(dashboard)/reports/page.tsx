'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Download, 
  Printer, 
  RefreshCw, 
  AlertTriangle, 
  Calendar, 
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Ban,
  Package,
  Layers
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import SalesChart from '@/components/ui/SalesChart';
import CategoryChart from '@/components/ui/CategoryChart';
import StatCard from '@/components/ui/StatCard';
import toast from 'react-hot-toast';

const StatusColors: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

export default function ReportsPage() {
  const [preset, setPreset] = useState<'7d' | '30d' | 'month' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Trigger date updates based on selected presets
  useEffect(() => {
    const today = new Date();
    if (preset === '7d') {
      setStartDate(format(subDays(today, 6), 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    } else if (preset === '30d') {
      setStartDate(format(subDays(today, 29), 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    } else if (preset === 'month') {
      setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
    } else if (preset === 'custom') {
      if (!customStart || !customEnd) {
        setCustomStart(format(startOfMonth(today), 'yyyy-MM-dd'));
        setCustomEnd(format(endOfMonth(today), 'yyyy-MM-dd'));
      }
      setStartDate(customStart);
      setEndDate(customEnd);
    }
  }, [preset]);

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const url = `/api/reports?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url);
      if (res.ok) {
        setReportsData(await res.json());
      } else {
        toast.error("Failed to load reports data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleCustomRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      if (new Date(customStart) > new Date(customEnd)) {
        toast.error("Start date cannot be after end date");
        return;
      }
      setStartDate(customStart);
      setEndDate(customEnd);
    }
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (!reportsData?.orders || reportsData.orders.length === 0) {
      toast.error("No transactions available in this range to export");
      return;
    }
    const headers = ["Order ID", "Customer", "Date", "Total Quantity", "Items Details", "Total Revenue ($)", "Status"];
    const rows = reportsData.orders.map((order: any) => {
      const totalQty = order.products.reduce((acc: number, p: any) => acc + p.quantity, 0);
      const details = order.products.map((p: any) => `${p.quantity}x ${p.name}`).join('; ');
      return [
        order._id,
        order.customerName,
        new Date(order.createdAt).toISOString().split('T')[0],
        totalQty,
        details,
        order.totalPrice.toFixed(2),
        order.status
      ];
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map((row: any[]) => row.map(val => {
        const cell = val === null || val === undefined ? "" : val.toString();
        return `"${cell.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded successfully");
  };

  // Print utility
  const handlePrint = () => {
    window.print();
  };

  // Client-side table filtering
  const filteredOrders = reportsData?.orders?.filter((o: any) => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 print:p-0 print:m-0 print:max-w-full">
      {/* Dynamic CSS styles loaded safely for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Reset parent containers that restrict height or overflow */
          html, body, 
          div[class*="h-screen"], 
          div[class*="overflow-hidden"], 
          div[class*="h-full"], 
          div[class*="flex-col"],
          div[class*="flex-row"],
          main, 
          .flex {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
          }
          
          /* Hide scrollbars specifically */
          ::-webkit-scrollbar {
            display: none !important;
          }
          * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide interactive filters, sidebars, headers, scrollbars */
          aside, nav, select, input, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            width: 100% !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            grid-column: span 3 / span 3 !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-cols: 1fr !important;
            gap: 16px !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            background-color: white !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
            color: black !important;
          }
        }
      `}} />

      {/* Print-Only Header */}
      <div className="hidden print:block border-b-2 border-zinc-800 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">INVENTORY HUB</h1>
            <p className="text-sm text-zinc-500 font-mono">Business Intelligence & Transaction Report</p>
          </div>
          <div className="text-right text-xs text-zinc-500 font-mono">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p>Range: {startDate} to {endDate}</p>
          </div>
        </div>
      </div>

      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center gap-3 w-fit">
            <FileText className="w-8 h-8 text-emerald-600" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Generate store analytics, configure custom timelines, and export data summaries.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={exportToCSV}
            disabled={loading || !reportsData?.orders?.length}
            className="flex-1 md:flex-initial bg-muted hover:bg-card text-foreground font-semibold px-4 py-2.5 rounded-xl border border-border transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter and Date Selector Bar */}
      <div className="bg-background border border-border p-4 rounded-2xl shadow-xl space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setPreset('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === '7d' 
                  ? 'bg-background text-emerald-600 shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPreset('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === '30d' 
                  ? 'bg-background text-emerald-600 shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPreset('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === 'month' 
                  ? 'bg-background text-emerald-600 shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPreset('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === 'custom' 
                  ? 'bg-background text-emerald-600 shadow-sm border border-border' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Custom Range
            </button>
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active Range: {startDate} to {endDate}</span>
          </div>
        </div>

        {preset === 'custom' && (
          <form onSubmit={handleCustomRangeSubmit} className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-muted border border-border rounded-xl animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full sm:w-auto flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div className="w-full sm:w-auto flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full bg-background border border-border text-foreground rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg px-4 py-2 flex items-center justify-center gap-1 transition-all h-[38px] cursor-pointer shadow-md shadow-emerald-500/10"
            >
              Apply Filter
            </button>
          </form>
        )}
      </div>

      {loading && !reportsData ? (
        <div className="flex flex-col items-center justify-center p-12 h-64 bg-background border border-border rounded-2xl shadow-xl">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-muted-foreground text-sm mt-3 font-medium">Aggregating report metrics...</p>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print-grid">
            <div className="print-shadow-none rounded-2xl">
              <StatCard
                title="Revenue"
                value={`$${reportsData?.summary?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                icon={DollarSign}
                color="emerald"
              />
            </div>
            <div className="print-shadow-none rounded-2xl">
              <StatCard
                title="Total Orders"
                value={reportsData?.summary?.totalOrders || 0}
                icon={ShoppingCart}
                color="indigo"
              />
            </div>
            <div className="print-shadow-none rounded-2xl">
              <StatCard
                title="Avg Order Value"
                value={`$${reportsData?.summary?.averageOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                icon={TrendingUp}
                color="cyan"
              />
            </div>
            <div className="print-shadow-none rounded-2xl">
              <StatCard
                title="Low Stock Items"
                value={reportsData?.summary?.lowStockCount || 0}
                icon={AlertTriangle}
                color="rose"
              />
            </div>
          </div>

          {/* Quick Orders Status Breakdown (Print and Dashboard view) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-background border border-border rounded-2xl shadow-xl print-shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Delivered</p>
                <p className="text-lg font-bold text-foreground">{reportsData?.summary?.completedOrders || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Pending</p>
                <p className="text-lg font-bold text-foreground">{reportsData?.summary?.pendingOrders || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Cancelled</p>
                <p className="text-lg font-bold text-foreground">{reportsData?.summary?.cancelledOrders || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">Items Sold</p>
                <p className="text-lg font-bold text-foreground">
                  {reportsData?.orders?.reduce((acc: number, o: any) => {
                    if (o.status === 'Cancelled') return acc;
                    return acc + o.products.reduce((qtyAcc: number, p: any) => qtyAcc + p.quantity, 0);
                  }, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print-grid print-full-width">
            <div className="lg:col-span-2 print-shadow-none">
              <SalesChart data={reportsData?.salesOverTime} title={`Sales Trend (${startDate} to ${endDate})`} loading={loading} />
            </div>
            <div className="print-shadow-none">
              <CategoryChart data={reportsData?.categoryBreakdown} title="Category Revenue" loading={loading} />
            </div>
          </div>

          {/* Detailed Transaction Report Table */}
          <div className="space-y-4 print-full-width">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Transaction Ledger
              </h2>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ID or Customer..."
                    className="w-full bg-background border border-border text-foreground text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none hover:border-zinc-400 transition-colors"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-background border border-border text-muted-foreground text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <h2 className="hidden print:block text-md font-bold text-black border-b pb-1 mb-2 font-mono">
              TRANSACTION LEDGER
            </h2>

            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-xl print-shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-card border-b border-border text-muted-foreground text-sm font-semibold print:bg-zinc-100 print:text-black">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 hidden md:table-cell">Purchase Details</th>
                      <th className="px-6 py-4">Total Revenue</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 text-sm print:divide-zinc-300">
                    {filteredOrders.map((order: any) => (
                      <tr key={order._id} className="hover:bg-card transition-colors print:hover:bg-transparent">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground print:text-black">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-card-foreground print:text-black">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground print:text-black max-w-[280px] truncate">
                            {order.products.map((p: any, i: number) => (
                              <span key={i}>
                                {p.quantity}x {p.name} (${p.priceAtPurchase.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold print:text-black font-mono">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs print:text-black font-mono">
                          {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${StatusColors[order.status]} print:border-zinc-300 print:bg-transparent print:text-black`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-semibold">
                          No transactions match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
