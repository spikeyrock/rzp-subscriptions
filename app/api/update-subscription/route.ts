import dbConnect from '@/app/lib/mongoose';
import Subscription from '@/app/models/Subscription';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, planId, quantity, currentStart, currentEnd, razorpay_subscription_id, razorpay_order_id } = await req.json();

  try {
    await dbConnect();

    const subscription = await Subscription.findOne({ email });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.planId = planId;
    subscription.quantity = quantity;
    subscription.currentStart = currentStart;
    subscription.currentEnd = currentEnd;
    subscription.paid = true;

    await subscription.save();

    return NextResponse.json({ success: true, subscription }, { status: 200 });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
