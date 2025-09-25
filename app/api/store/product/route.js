import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { storeId: process.env.STORE_ID },
      include: { rating: true }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/store/product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, mrp, price, category, images } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images,
        storeId: process.env.STORE_ID   // ✅ single-vendor
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST /api/store/product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
