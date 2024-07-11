import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  const plan_id = "plan_OWzN7hfiULu9yI"; // Monthly plan ID
  const email = req.headers.get('email'); // Get email from headers

  console.log("Received email:", email); // Log the received email

  try {
    console.log("Creating monthly subscription with plan_id:", plan_id);
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: {
        key1: "value3",
        key2: "value2"
      }
    });
    console.log("Subscription created:", subscription);

    // Include the email in the response for saving later
    return NextResponse.json({ ...subscription, email }, { status: 200 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
