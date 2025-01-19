import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const getTokenKey = () => {
  if (!localStorage.getItem('token')) {
    return null
  }
  return localStorage.getItem('token')
}

export const VendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenKey()
      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['VENDOR', 'VENDORS'],
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (page = 1) => `vendor/?page=${page}`,
      providesTags: ['VENDORS']
    }),
    addVendor: builder.mutation({
      query: (body) => ({
        url: 'vendor/',
        method: 'post',
        body: body
      }),
      invalidatesTags: ['VENDORS']
    }),
    getVendorById: builder.query({
      query: (id) => `vendor/${id}`,
      providesTags: ['VENDOR']
    }),
    getVendorByUser: builder.query({
      query: () => 'vendor/user/',
      providesTags: ['VENDOR']
    }),
    updateVendor: builder.mutation({
      query: (body) => ({
        url: `vendor/${body.id}/`,
        method: 'put',
        body: body
      }),
      invalidatesTags: ['VENDOR', 'VENDORS']
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `vendor/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['VENDOR', 'VENDORS']
    }),
    addVendorItem: builder.mutation({
      query: (body) => ({
        url: 'vendor-item/',
        method: 'post',
        body: body
      }),
      invalidatesTags: ['VENDOR']
    }),
    updateVendorItem: builder.mutation({
      query: (body) => ({
        url: `vendor-item/${body.itemId}/`,
        method: 'put',
        body: body
      }),
      invalidatesTags: ['VENDOR']
    }),
    deleteVendorItem: builder.mutation({
      query: (id) => ({
        url: `vendor-item/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['VENDOR']
    }),
    addVendorPayment: builder.mutation({
      query: (body) => ({
        url: 'vendor-payment/',
        method: 'post',
        body: body
      }),
      invalidatesTags: ['VENDOR', 'VENDORS']
    }),
    deleteVendorPayment: builder.mutation({
      query: (id) => ({
        url: `vendor-payment/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['VENDOR', 'VENDORS']
    }),
    getVendorItems: builder.query({
      query: () => 'vendor-item',
    }),
  })
})

export const {
  useGetVendorsQuery,
  useAddVendorMutation,
  useGetVendorByIdQuery,
  useGetVendorByUserQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useAddVendorItemMutation,
  useUpdateVendorItemMutation,
  useDeleteVendorItemMutation,
  useAddVendorPaymentMutation,
  useDeleteVendorPaymentMutation,
  useGetVendorItemsQuery
} = VendorApi