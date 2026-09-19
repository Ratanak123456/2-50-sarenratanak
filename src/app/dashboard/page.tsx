'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
  useGetProductsQuery, 
  useGetCategoriesQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from "@/lib/feature/api/product" 

export default function Page() {
  const { data: products = [], isLoading: isProductsLoading, isError: isProductsError } = useGetProductsQuery()
  const { data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetCategoriesQuery()

  const [addProduct] = useAddProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()

  const isLoading = isProductsLoading || isCategoriesLoading
  const isError = isProductsError || isCategoriesError

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>

              {/* Data Table with API status handling */}
              {isLoading ? (
                <div className="text-center py-10 text-muted-foreground">Loading products and categories...</div>
              ) : isError ? (
                <div className="text-center py-10 text-red-500">Failed to load data from API.</div>
              ) : (
                <DataTable 
                  data={products} 
                  categories={categories}
                  onAddProduct={(newProduct) => addProduct(newProduct)}
                  onUpdateProduct={(updatedProduct) => updateProduct(updatedProduct)}
                  onDeleteProduct={(id) => deleteProduct(id)}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}