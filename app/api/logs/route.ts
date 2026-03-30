import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';

export async function GET() {
  try {
    await connectToDatabase();
    // grab the latest 10 logs
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch logs', error: error.message }, { status: 500 });
  }
}
