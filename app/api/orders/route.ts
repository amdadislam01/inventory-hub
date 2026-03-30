import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import ActivityLog from '@/models/ActivityLog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).populate('products.product', 'name').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch orders', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, products } = await req.json();

    if (!customerName || !products || products.length === 0) {
      return NextResponse.json({ message: 'Customer name and products are required' }, { status: 400 });
    }

    await connectToDatabase();

    // make sure there are no duplicate items
    const productIds = products.map((p: any) => p.product);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      return NextResponse.json({ message: 'Duplicate products found in the order' }, { status: 400 });
    }

    let totalPrice = 0;
    const finalProducts = [];
    const stockUpdates = [];

    // check stock and sum up prices
    for (const item of products) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return NextResponse.json({ message: `Product ${item.product} not found` }, { status: 404 });
      }

      if (dbProduct.status !== 'Active') {
         return NextResponse.json({ message: `Product ${dbProduct.name} is currently unavailable` }, { status: 400 });
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ message: `Only ${dbProduct.stock} items available in stock for ${dbProduct.name}` }, { status: 400 });
      }

      const itemTotal = dbProduct.price * item.quantity;
      totalPrice += itemTotal;

      finalProducts.push({
        product: dbProduct._id,
        quantity: item.quantity,
        priceAtPurchase: dbProduct.price,
      });

      // queue stock update
      const newStock = dbProduct.stock - item.quantity;
      const status = newStock === 0 ? 'Out of Stock' : 'Active';
      stockUpdates.push({ id: dbProduct._id, stock: newStock, status, name: dbProduct.name });
    }

    // save the order
    const newOrder = await Order.create({
      customerName,
      products: finalProducts,
      totalPrice,
      status: 'Pending',
    });

    // reduce stock and add a log entry
    for (const update of stockUpdates) {
      await Product.findByIdAndUpdate(update.id, { stock: update.stock, status: update.status });
      if (update.status === 'Out of Stock') {
          await ActivityLog.create({
             action: `Product "${update.name}" became Out of Stock`,
             details: `Due to order #${newOrder._id}`,
          });
      }
    }

    await ActivityLog.create({
       action: `Order #${newOrder._id} created`,
       details: `For customer ${customerName} with total $${totalPrice}`,
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create order', error: error.message }, { status: 500 });
  }
}
