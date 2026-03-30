import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    // fetch actual category info
    const products = await Product.find({}).populate('category', 'name').sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, price, stock, threshold } = await req.json();

    if (!name || !category || price == null || stock == null) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    const catExists = await Category.findById(category);
    if (!catExists) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const status = stock > 0 ? 'Active' : 'Out of Stock';

    const newProduct = await Product.create({
      name,
      category,
      price,
      stock,
      threshold: threshold || 5,
      status,
    });
    
    // log this in the background

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create product', error: error.message }, { status: 500 });
  }
}
