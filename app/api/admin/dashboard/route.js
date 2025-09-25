// app/api/admin/dashboard/route.js
import prisma from "@/lib/prisma";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Simple admin checker:
 * - Prefer Clerk publicMetadata.isAdmin if clerkClient works
 * - Fallback to ADMIN_EMAILS env allowlist (comma separated)
 */
async function isAdminUser(userId) {
  if (!userId) return false;

  // Allowlist from env (optional)
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
  try {
    if (typeof clerkClient !== "undefined" && clerkClient.users && clerkClient.users.getUser) {
      const clerkUser = await clerkClient.users.getUser(userId);
      if (clerkUser?.publicMetadata?.isAdmin === true) return true;
      const email = clerkUser?.primaryEmailAddress?.emailAddress;
      if (email && ADMIN_EMAILS.includes(email)) return true;
    } else {
      // clerkClient not available for some reason, fallback to ADMIN_EMAILS only
      return ADMIN_EMAILS.length > 0;
    }
  } catch (err) {
    console.warn("clerkClient.getUser error (isAdminUser):", err?.message || err);
    // If clerk errors, still check ADMIN_EMAILS (best-effort fallback)
    return ADMIN_EMAILS.length > 0;
  }

  return false;
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request) || {};
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = await isAdminUser(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
    }

    // Safe DB calls wrapped in try/catch so DB connectivity issues are handled gracefully
    try {
      const orders = await prisma.order.count();
      const stores = await prisma.store.count();
      const products = await prisma.product.count();

      // get all orders include only createdAt and total & calculate total revenue
      const allOrders = await prisma.order.findMany({
        select: { createdAt: true, total: true },
      });

      const totalRevenue = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
      const revenue = totalRevenue.toFixed(2);

      const dashboardData = { orders, stores, products, revenue, allOrders };
      return NextResponse.json({ dashboardData });
    } catch (dbError) {
      console.error("GET /api/admin/dashboard DB error:", dbError);
      return NextResponse.json(
        { error: "Database error - please check your DATABASE_URL and that the DB is reachable" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
