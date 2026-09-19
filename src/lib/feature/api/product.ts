import { ProductType } from '@/lib/type/productType'
import { CategoryType } from '@/lib/type/categoryType' // Make sure you have this type defined
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.escuelajs.co/api/v1/"
    }),
    tagTypes: ['Products', 'Categories'],
    endpoints: (build) => ({
        getProducts: build.query<ProductType[], void>({
            query: () => 'products',
            providesTags: ['Products'],
        }),
        addProduct: build.mutation<ProductType, Partial<ProductType>>({
            query: (body) => ({
                url: `products`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Products'],
        }),
        getProductById: build.query<ProductType, string>({
            query: (id) => `products/${id}`,
        }),
        updateProduct: build.mutation<void, Pick<ProductType, 'id'> & Partial<ProductType>>({
            query: ({ id, ...patch }) => ({
                url: `products/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: ['Products'],
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    api.util.updateQueryData('getProductById', id, (draft) => {
                        Object.assign(draft, patch)
                    }),
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
        }),
        deleteProduct: build.mutation<{ success: boolean; id: number }, number>({
            query(id) {
                return {
                    url: `products/${id}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: ['Products'],
        }),
        getCategories: build.query<CategoryType[], void>({
            query: () => 'categories',
            providesTags: ['Categories'],
        }),
        getCategoryById: build.query<CategoryType, string>({
            query: (id) => `categories/${id}`,
            providesTags: (result, error, id) => [{ type: 'Categories', id }],
        }),
    }),
})

export const {
    useGetProductByIdQuery,
    useGetProductsQuery,
    useAddProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
} = api