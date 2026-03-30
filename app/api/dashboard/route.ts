import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // orders for today
    const totalOrdersToday = await Order.countDocuments({ createdAt: { $gte: today } });

    // order statuses
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });

    // items running low
    const allProducts = await Product.find({});
    let lowStockCount = 0;
    allProducts.forEach((p) => {
        if (p.stock < p.threshold) lowStockCount++;
    });

    // today's total revenue
    const todayOrders = await Order.find({ createdAt: { $gte: today }, status: { $ne: 'Cancelled' } });
    const revenueToday = todayOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // top 5 products
    const productSummary = await Product.find({}).limit(5).select('name stock threshold status');

    return NextResponse.json({
        totalOrdersToday,
        pendingOrders,
        completedOrders,
        lowStockCount,
        revenueToday,
        productSummary
    });
  } catch (error: any) {
     return NextResponse.json({ message: 'Failed to fetch dashboard data', error: error.message }, { status: 500 });
  }
}
