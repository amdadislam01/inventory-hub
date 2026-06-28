import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { startOfDay, endOfDay, eachDayOfInterval, format, subDays, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = startOfDay(parseISO(startDateParam));
      endDate = endOfDay(parseISO(endDateParam));
    } else {
      // Default to last 30 days
      endDate = endOfDay(new Date());
      startDate = startOfDay(subDays(endDate, 29));
    }

    // 1. Fetch orders in the range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate({
      path: 'products.product',
      select: 'name price category',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // 2. Fetch all products to calculate low stock count
    const allProducts = await Product.find({});
    const lowStockCount = allProducts.filter((p) => p.stock < p.threshold).length;

    // 3. Generate a continuous interval of days to ensure all days are represented in charts
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });
    const salesOverTimeMap = new Map<string, { date: string; revenue: number; orders: number }>();

    daysInterval.forEach((day) => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      salesOverTimeMap.set(formattedDate, {
        date: format(day, 'MMM dd'),
        revenue: 0,
        orders: 0,
      });
    });

    let totalRevenue = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    const categoryMap = new Map<string, { name: string; value: number; quantity: number }>();
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach((order) => {
      const orderDate = format(new Date(order.createdAt), 'yyyy-MM-dd');
      const isCancelled = order.status === 'Cancelled';
      const isPending = order.status === 'Pending';
      const isDelivered = order.status === 'Delivered';

      if (isCancelled) {
        cancelledOrders++;
      } else if (isPending) {
        pendingOrders++;
      } else {
        completedOrders++;
      }

      // Populate sales trends (only include non-cancelled orders in revenue/sales counters)
      if (!isCancelled) {
        totalRevenue += order.totalPrice;
        const dailyData = salesOverTimeMap.get(orderDate);
        if (dailyData) {
          dailyData.revenue += order.totalPrice;
          dailyData.orders += 1;
        }

        // Process products in order
        order.products.forEach((pItem: any) => {
          const productDoc = pItem.product;
          if (!productDoc) return;

          const qty = pItem.quantity;
          const price = pItem.priceAtPurchase || productDoc.price || 0;
          const itemRevenue = price * qty;

          // Product breakdown
          const prodId = productDoc._id.toString();
          const prodData = productSalesMap.get(prodId) || { name: productDoc.name, quantity: 0, revenue: 0 };
          prodData.quantity += qty;
          prodData.revenue += itemRevenue;
          productSalesMap.set(prodId, prodData);

          // Category breakdown
          const categoryName = productDoc.category?.name || 'Uncategorized';
          const catData = categoryMap.get(categoryName) || { name: categoryName, value: 0, quantity: 0 };
          catData.value += itemRevenue;
          catData.quantity += qty;
          categoryMap.set(categoryName, catData);
        });
      }
    });

    const salesOverTime = Array.from(salesOverTimeMap.values());
    const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const nonCancelledOrdersCount = orders.filter((o) => o.status !== 'Cancelled').length;
    const averageOrderValue = nonCancelledOrdersCount > 0 ? totalRevenue / nonCancelledOrdersCount : 0;

    const detailedOrders = orders.map((o: any) => ({
      _id: o._id,
      customerName: o.customerName,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt,
      products: o.products.map((p: any) => ({
        name: p.product?.name || 'Unknown Product',
        quantity: p.quantity,
        priceAtPurchase: p.priceAtPurchase || p.product?.price || 0
      }))
    }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        nonCancelledOrdersCount,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        lowStockCount,
      },
      salesOverTime,
      categoryBreakdown,
      topProducts,
      orders: detailedOrders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to fetch reports data', error: error.message },
      { status: 500 }
    );
  }
}
