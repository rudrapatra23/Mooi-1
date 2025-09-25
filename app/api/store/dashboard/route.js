import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import authAdmin from "@/middlewares/authAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const orders = await prisma.order.count();
    const stores = await prisma.store.count();
    const products = await prisma.product.count();

    const allOrders = await prisma.order.findMany({
      select: { createdAt: true, total: true },
    });

    const totalRevenue = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const revenue = totalRevenue.toFixed(2);

    return NextResponse.json({
      dashboardData: { orders, stores, products, revenue, allOrders },
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
