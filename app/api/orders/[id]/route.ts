import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import ActivityLog from '@/models/ActivityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json();
    const { id } = await params;

    const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    
    const order = await Order.findById(id);
    if (!order) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    await ActivityLog.create({
        action: `Order #${order._id} marked as ${status}`,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update order', error: error.message }, { status: 500 });
  }
}
