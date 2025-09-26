// app/api/store/product/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const STORE_ID = process.env.STORE_ID || null;

// helper to return JSON with CORS-friendly headers for OPTIONS/preflight
function jsonWithCors(body, opts = {}) {
  const init = opts;
  init.headers = Object.assign({}, init.headers || {}, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  return NextResponse.json(body, init);
}

export async function OPTIONS() {
  // respond to preflight requests from browser
  return jsonWithCors(null, { status: 200 });
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    if (productId) {
      // return a single product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { rating: true }
      });

      if (!product) return jsonWithCors({ error: "Product not found" }, { status: 404 });
      return jsonWithCors(product, { status: 200 });
    }

    // list all products for this store (existing behavior)
    const products = await prisma.product.findMany({
      where: { storeId: STORE_ID },
      include: { rating: true }
    });
    return jsonWithCors(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/store/product error:", error);
    return jsonWithCors({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Accepts either:
 *  - multipart/form-data (files + fields)  OR
 *  - JSON body with images as array of URLs/strings
 *
 * Frontend currently sends FormData (images), so this branch is required.
 */
export async function POST(request) {
  try {
    const contentType = (request.headers.get("content-type") || "").toLowerCase();

    let payload = null;
    let images = [];

    if (contentType.includes("multipart/form-data")) {
      // parse formData
      // Note: in Next.js app router request.formData() is available
      const form = await request.formData();

      // extract fields
      const name = form.get("name");
      const description = form.get("description");
      const mrpRaw = form.get("mrp");
      const priceRaw = form.get("price");
      const category = form.get("category");

      // files: there may be multiple 'images' entries
      const fileEntries = form.getAll("images"); // returns File objects or empty array

      // convert each File to base64 data URL (simple dev-friendly approach)
      for (const file of fileEntries) {
        // file can be a File object (browser) or a string (if client sent a string)
        if (!file) continue;
        if (typeof file === "string") {
          // already a URL or base64 string
          images.push(file);
          continue;
        }
        // It's a File object with arrayBuffer()
        try {
          const buffer = await file.arrayBuffer();
          // convert to base64
          const arr = new Uint8Array(buffer);
          let binary = "";
          for (let i = 0; i < arr.byteLength; i++) {
            binary += String.fromCharCode(arr[i]);
          }
          const base64Flag = `data:${file.type};base64,`;
          const base64 = base64Flag + Buffer.from(binary, "binary").toString("base64");
          images.push(base64);
        } catch (err) {
          console.error("Error converting file to base64:", err);
        }
      }

      payload = {
        name,
        description,
        mrp: mrpRaw,
        price: priceRaw,
        category,
        images
      };
    } else {
      // assume application/json or other text; parse safely
      const raw = await request.text();
      if (!raw || raw.length === 0) {
        return jsonWithCors({ error: "Empty request body" }, { status: 400 });
      }
      try {
        const body = JSON.parse(raw);
        payload = body;
        // if client sent images array in JSON use it
        images = Array.isArray(body.images) ? body.images : [];
      } catch (e) {
        console.error("Invalid JSON body in POST /api/store/product:", e.message, "RAW:", raw.slice(0,200));
        return jsonWithCors({ error: "Invalid JSON body: " + e.message }, { status: 400 });
      }
    }

    // Validate payload
    const { name, description, mrp, price, category } = payload || {};
    if (!name || String(name).trim().length === 0) {
      return jsonWithCors({ error: "name required" }, { status: 400 });
    }
    if (typeof price === "undefined" || price === null || String(price).trim() === "") {
      return jsonWithCors({ error: "price required" }, { status: 400 });
    }

    // coerce numeric fields
    const priceNum = Number(price);
    const mrpNum = typeof mrp !== "undefined" && mrp !== null && String(mrp).trim() !== "" ? Number(mrp) : null;

    if (Number.isNaN(priceNum)) return jsonWithCors({ error: "price must be a number" }, { status: 400 });
    if (mrp !== null && Number.isNaN(mrpNum)) return jsonWithCors({ error: "mrp must be a number" }, { status: 400 });

    // Create product in DB
    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description) : "",
        mrp: mrpNum,
        price: priceNum,
        category: category ? String(category) : "",
        images: images || [],
        storeId: STORE_ID
      }
    });

    return jsonWithCors({ ok: true, product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/store/product error:", error);
    return jsonWithCors({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return jsonWithCors({ error: "productId required" }, { status: 400 });

    // Ensure product belongs to this store before deleting (safety)
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, storeId: true }
    });

    if (!existing) return jsonWithCors({ error: "Product not found" }, { status: 404 });
    if (existing.storeId !== STORE_ID) {
      return jsonWithCors({ error: "Unauthorized: product belongs to different store" }, { status: 403 });
    }

    // Delete product (adjust cascade logic if you have related tables)
    await prisma.product.delete({ where: { id: productId } });

    return jsonWithCors({ ok: true, productId }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/store/product error:", error);
    return jsonWithCors({ error: error.message }, { status: 500 });
  }
}
