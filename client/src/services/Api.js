import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const getTokenKey = () => {
  if (!localStorage.getItem('token')) {
    return null
  }
  return localStorage.getItem('token')
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const Api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenKey()
      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken)
      }
      return headers
    }
  }),
  tagTypes: ['USER', 'VENDOR', 'VENDORS'],
  endpoints: (builder) => ({
    // User endpoints
    getUser: builder.query({
      query: () => 'user/me/',
      providesTags: ['USER']
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: 'user/create/',
        method: 'post',
        body: body
      }),
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
    }),
    updateUser: builder.mutation({
      query: (body) => ({
        url: 'user/me/',
        method: 'put',
        body: body
      }),
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
    }),
    login: builder.mutation({
      query: (body) => ({
        url: 'user/token/',
        method: 'post',
        body: body,
      }),
    }),
    signOut: builder.mutation({
      queryFn: () => {
        localStorage.clear();
        return []
      },
      invalidatesTags: ['USER']
    }),
    // Vendor endpoints
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
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
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
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `vendor/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
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
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
    }),
    deleteVendorPayment: builder.mutation({
      query: (id) => ({
        url: `vendor-payment/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['USER', 'VENDOR', 'VENDORS']
    }),
    getVendorItems: builder.query({
      query: () => 'vendor-item',
    }),
  })
})

export const {
  useGetUserQuery,
  useLazyGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useLoginMutation,
  useSignOutMutation,
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
} = Api
