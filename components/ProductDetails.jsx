"use client";

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const [mainImage, setMainImage] = useState(
    product.images && product.images.length ? product.images[0] : ""
  );

  const addToCartHandler = () => {
    dispatch(addToCart({ productId }));
  };

  const averageRating =
    product.rating && product.rating.length > 0
      ? product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length
      : 0;

  return (
    <div className="flex max-lg:flex-col gap-12">
      {/* Image section */}
      <div className="flex max-sm:flex-col-reverse gap-3">
        {/* Thumbnails */}
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(product.images[index])}
              className="bg-slate-100 flex items-center justify-center w-16 h-16 rounded-lg cursor-pointer"
              type="button"
            >
              <img
                src={image}
                alt={`thumb-${index}`}
                className="max-w-full max-h-full object-contain block"
              />
            </button>
          ))}
        </div>

        {/* Main Image (fixed size) */}
        <div className="flex justify-center items-center">
          <div className="w-[400px] h-[400px] bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-md">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="max-w-full max-h-full object-contain block"
              />
            ) : (
              <div className="text-slate-400">No image available</div>
            )}
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>

        {/* Ratings */}
        <div className="flex items-center mt-2">
          {Array(5)
            .fill("")
            .map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-transparent mt-0.5"
                fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
              />
            ))}
          <p className="text-sm ml-3 text-slate-500">
            {product.rating?.length || 0} Reviews
          </p>
        </div>

        {/* Prices */}
        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {currency}
            {product.price}
          </p>
          {product.mrp > product.price && (
            <p className="text-xl text-slate-500 line-through">
              {currency}
              {product.mrp}
            </p>
          )}
        </div>

        {/* Discount line */}
        {product.mrp > product.price && (
          <div className="flex items-center gap-2 text-slate-500">
            <TagIcon size={14} />
            <p>
              Save{" "}
              {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}
              % right now
            </p>
          </div>
        )}

        {/* Cart buttons */}
        <div className="flex items-end gap-5 mt-10">
          {cart[productId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-slate-800 font-semibold">Quantity</p>
              <Counter productId={productId} />
            </div>
          )}
          <button
            onClick={() =>
              !cart[productId] ? addToCartHandler() : router.push("/cart")
            }
            className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition"
            type="button"
          >
            {!cart[productId] ? "Add to Cart" : "View Cart"}
          </button>
        </div>

        <hr className="border-gray-300 my-5" />

        {/* Info lines */}
        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3">
            <EarthIcon className="text-slate-400" /> Free shipping on orders above ₹500
          </p>
          <p className="flex gap-3">
            <CreditCardIcon className="text-slate-400" /> 100% Secured Payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
