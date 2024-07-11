import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  const { amount = 6000000, currency = 'INR' } = await req.json(); // 60000 INR in paise
  const email = req.headers.get('email'); // Get email from headers

  console.log("Received email:", email); // Log the received email

  try {
    console.log("Creating direct checkout order with amount:", amount);
    const order = await instance.orders.create({
      amount,
      currency,
      payment_capture: true,
      notes: {
        key1: "value3",
        key2: "value2"
      }
    });
    console.log("Order created:", order);

    // Include the email in the response for saving later
    return NextResponse.json({ ...order, email }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
