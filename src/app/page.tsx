'use client'

import ProductCard from '@/components/Card'
import { useGetProductsQuery } from '@/lib/feature/api/product'
import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 9

export default function Home() {
  const { data: products, isLoading, error } = useGetProductsQuery()
  const [currentPage, setCurrentPage] = useState(1)

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return [...products].sort((a, b) => b.id - a.id)
  }, [products])

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedProducts, currentPage])

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-center py-16 px-6 bg-white dark:bg-black">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Our Products</h1>

        {/* Loading State */}
        {isLoading && (
          <p className="text-zinc-500 animate-pulse">Loading products...</p>
        )}

        {/* Error State */}
        {error && (
          <p className="text-red-500">Failed to load products. Please try again later.</p>
        )}

        {/* Product Grid */}
        {products && (
          <div className="w-full flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}