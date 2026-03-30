import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ActivityLog from '@/models/ActivityLog';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { stock, price, status } = await req.json();
    const { id } = await params;

    await connectToDatabase();
    
    const product = await Product.findById(id);
    if (!product) {
       return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // figure out stock status
    let finalStatus = status || product.status;
    if (stock !== undefined) {
        product.stock = stock;
        if (stock === 0) finalStatus = 'Out of Stock';
        if (stock > 0 && finalStatus === 'Out of Stock') finalStatus = 'Active';
    }

    if (price !== undefined) product.price = price;
    product.status = finalStatus;

    await product.save();

    await ActivityLog.create({
        action: `Stock/Details updated for "${product.name}"`,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update product', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
     return NextResponse.json({ message: 'Failed to delete product', error: error.message }, { status: 500 });
  }
}
