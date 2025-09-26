'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

  // safe avg rating (avoid divide by zero)
  const rating =
    product?.rating && product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0

  // fallback image
  const imgSrc =
    product?.images && product.images.length > 0
      ? product.images[0]
      : '/placeholder-400.png'

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block max-w-[240px] mx-auto"
    >
      {/* Thumbnail card */}
      <div className="bg-[#F5F5F5] w-[220px] h-[220px] sm:w-60 sm:h-60 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imgSrc}
            alt={product.name || 'product'}
            fill
            sizes="(max-width: 640px) 100vw, 220px"
            style={{ objectFit: 'contain' }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex justify-between gap-3 text-sm text-slate-800 pt-3 max-w-[220px]">
        <div className="min-w-0">
          <p className="truncate font-medium">{product.name}</p>
          <div className="flex mt-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon
                key={index}
                size={14}
                className="text-transparent mt-0.5"
                fill={rating >= index + 1 ? '#00C950' : '#D1D5DB'}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end whitespace-nowrap">
          <p className="font-semibold">
            {currency}
            {product.price}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
