// app/api/payments/webhook/route.js  (or wherever your webhook file is)
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const config = {
  api: { bodyParser: false }, // keep raw body for signature verification
};

const EXPECTED_APP_ID = process.env.APP_ID || "gocart"; // change to 'mooiprofessional' if you renamed

async function markOrdersPaid(orderIdsArray, userId) {
  await Promise.all(
    orderIdsArray.map(async (orderId) => {
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
    })
  );

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });
  }
}

async function deleteOrders(orderIdsArray) {
  await Promise.all(
    orderIdsArray.map(async (orderId) => {
      await prisma.order.delete({
        where: { id: orderId },
      });
    })
  );
}

export async function POST(request) {
  try {
    // raw body required to verify signature
    const bodyText = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-razorpay-signature");

    if (!webhookSecret) {
      console.error("Razorpay webhook: missing RAZORPAY_WEBHOOK_SECRET env var");
      return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
    }

    if (!signature) {
      console.warn("Razorpay webhook: missing signature header");
      return NextResponse.json({ error: "missing signature" }, { status: 400 });
    }

    // compute expected signature and compare
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(bodyText).digest("hex");
    if (signature !== expectedSignature) {
      console.warn("Razorpay webhook: signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // parse payload after verification
    const event = JSON.parse(bodyText);
    const eventName = event?.event;

    // safe extraction helper: returns {orderIdsArray, userId, appId} or throws
    function extractNotesFromEvent(evt) {
      const paymentEntity = evt?.payload?.payment?.entity;
      const notes = paymentEntity?.notes;
      if (!notes) {
        throw new Error("Missing notes in payment entity");
      }
      const { orderIds, userId, appId } = notes;
      if (!orderIds) throw new Error("Missing orderIds in notes");
      const orderIdsArray = orderIds.split(",").map((s) => s.trim()).filter(Boolean);
      return { orderIdsArray, userId, appId };
    }

    // route the event
    switch (eventName) {
      case "payment.captured": {
        try {
          const { orderIdsArray, userId, appId } = extractNotesFromEvent(event);

          if (appId !== EXPECTED_APP_ID) {
            console.warn("Razorpay webhook: unexpected appId", appId);
            // respond 200 so webhook isn't retried, but indicate invalid appId
            return NextResponse.json({ received: true, message: "Invalid app id" }, { status: 200 });
          }

          await markOrdersPaid(orderIdsArray, userId);
          return NextResponse.json({ received: true }, { status: 200 });
        } catch (innerErr) {
          console.error("Razorpay webhook (payment.captured) error:", innerErr);
          // don't throw — respond 400 so Razorpay can surface the error in dashboard
          return NextResponse.json({ error: innerErr.message }, { status: 400 });
        }
      }

      case "payment.failed": {
        try {
          const { orderIdsArray, userId, appId } = extractNotesFromEvent(event);

          if (appId !== EXPECTED_APP_ID) {
            console.warn("Razorpay webhook: unexpected appId", appId);
            return NextResponse.json({ received: true, message: "Invalid app id" }, { status: 200 });
          }

          await deleteOrders(orderIdsArray);
          return NextResponse.json({ received: true }, { status: 200 });
        } catch (innerErr) {
          console.error("Razorpay webhook (payment.failed) error:", innerErr);
          return NextResponse.json({ error: innerErr.message }, { status: 400 });
        }
      }

      default:
        console.log("Razorpay webhook: unhandled event type:", eventName);
        return NextResponse.json({ received: true, message: "Unhandled event" }, { status: 200 });
    }
  } catch (error) {
    console.error("Razorpay webhook: unexpected error:", error);
    return NextResponse.json({ error: error.message || "server error" }, { status: 500 });
  }
}
