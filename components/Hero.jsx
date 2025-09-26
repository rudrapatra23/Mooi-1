'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CategoriesMarquee from './CategoriesMarquee'
import { assets } from '@/assets/assets'

const SLIDE_INTERVAL = 5000 // 5 seconds

const HeroSlideshow = () => {
  const slides = [assets.slideshow1, assets.slideshow2, assets.slideshow3]

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % slides.length)
      }, SLIDE_INTERVAL)
    }
    return () => clearInterval(intervalRef.current)
  }, [paused, slides.length])

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  return (
    <section className="mx-6">
      <div className="max-w-7xl mx-auto my-10">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-gray-50"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides */}
          <div className="relative h-[420px] md:h-[520px] lg:h-[560px]">
            {slides.map((src, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out
                  ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={src}
                      alt={`slide-${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 1200px"
                      style={{ objectFit: 'contain' }}
                      className="select-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white z-20"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicators */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === index
                    ? 'bg-slate-800 w-8 rounded-full'
                    : 'bg-white/80 border border-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories marquee below hero */}
        <div className="mt-8">
          <CategoriesMarquee />
        </div>
      </div>
    </section>
  )
}

export default HeroSlideshow
