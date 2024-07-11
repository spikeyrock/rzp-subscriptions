import dbConnect from '@/app/lib/mongoose';
import Subscription from '@/app/models/Subscription';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, plan } = await req.json();

  try {
    await dbConnect();

    // Validate and ensure required fields are present
    if (!email) {
      throw new Error('Email is required');
    }
    if (!plan) {
      throw new Error('Plan is required');
    }

    const newSubscription = new Subscription({
      email,
      plan,
      paid: false,
    });

    await newSubscription.save();

    return NextResponse.json({ success: true, subscription: newSubscription }, { status: 200 });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
