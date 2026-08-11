import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import ActivityLog from '@/models/ActivityLog';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    // Check if any products are linked to this category
    const associatedProductsCount = await Product.countDocuments({ category: id });
    if (associatedProductsCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category. ${associatedProductsCount} product(s) are assigned to this category.` },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    await ActivityLog.create({
      action: `Category deleted: "${category.name}"`,
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete category', error: error.message }, { status: 500 });
  }
}
