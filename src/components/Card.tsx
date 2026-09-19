import { ProductType } from '@/lib/type/productType'
import Image from 'next/image'
import React from 'react'

export default function ProductCard({
    title,
    description,
    price,
    images,
}: ProductType) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <Image 
                    src={images && images.length > 0 ? images[0] : '/placeholder.jpg'} 
                    alt={title} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                />
                <div className="absolute top-3 right-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md dark:bg-white/80 dark:text-zinc-900">
                    SALE
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                    <h3 className="line-clamp-1 font-semibold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                        {title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {description}
                    </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        ${price.toFixed(2)}
                    </span>
                    <button 
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    )
}