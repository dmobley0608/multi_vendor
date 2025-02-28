import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL + '/api'

const getTokenKey = () => {
  return localStorage.getItem('token')
}

export const Api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenKey()
      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['USER', 'VENDORS', 'SETTINGS', 'BOOTH_CHARGES'],
  endpoints: (builder) => ({
    // User endpoints
    getUser: builder.query({
      query: () => 'auth/me/',
      providesTags: ['USER']
    }),
    login: builder.mutation({
      query: (body) => ({
        url: 'auth/login/',
        method: 'post',
        body: body,
      }),
    }),
    signOut: builder.mutation({
      query: () => ({ url: 'auth/logout/', method: 'get' }),
      invalidatesTags: ['USER']
    }),
    changeMyPassword: builder.mutation({
      query: ({...body}) => ({
        url: 'auth/me/update-password/',
        method: 'post',
        body: { ...body }
      })
    }),
    // Vendor endpoints
    getVendors: builder.query({
      query: () => 'vendors/',
      providesTags: ['VENDORS']
    }),
    getVendorMonthlyReport: builder.query({
      query: ({ year, month }) => `vendors/reports/monthly/${year}/${month}`,
      providesTags: ['VENDORS']
    }),
    resetVendorPassword: builder.mutation({
      query: (id) => ({
        url: `vendors/reset-password/`,
        method: 'post',
        body: { id }
      })
    }),
    addVendor: builder.mutation({
      query: (body) => ({
        url: 'vendors/',
        method: 'post',
        body: body
      }),
      invalidatesTags: ['VENDORS']
    }),
    getVendorById: builder.query({
      query: (id) => `vendors/${id}`,
      providesTags: ['VENDORS']
    }),
    getVendorByUser: builder.query({
      query: () => `vendors/user/vendor`,
      providesTags: ['VENDORS']
    }),
    updateVendor: builder.mutation({
      query: (body) => ({
        url: `vendors/${body.id}/`,
        method: 'put',
        body: body
      }),
      invalidatesTags: ['VENDORS']
    }),
    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `vendors/${id}/`,
        method: 'delete',
      }),
      invalidatesTags: ['VENDORS']
    }),
    updateVendorBalance: builder.mutation({
      query: ({ vendorId, amount }) => ({
        url: `vendors/${vendorId}/balance/`,
        method: 'PUT',
        body: { amount }
      }),
      invalidatesTags: ['VENDORS']
    }),
    // Settings endpoints
    getSettings: builder.query({
      query: () => 'settings/',
      providesTags: ['SETTINGS']
    }),
    getSettingByKey: builder.query({
      query: (key) => `settings/${key}/`,
      providesTags: ['SETTINGS']
    }),
    updateSettingByKey: builder.mutation({
      query: ({ key, value }) => ({
        url: `settings/${key}/`,
        method: 'put',
        body: { value }
      }),
      invalidatesTags: ['SETTINGS']
    }),
    // Booth Charge endpoints
    getAllCharges: builder.query({
      query: () => 'booth-charges/',
      providesTags: ['BOOTH_CHARGES']
    }),
    getVendorCharges: builder.query({
      query: (vendorId) => `booth-charges/vendor/${vendorId}`,
      providesTags: ['BOOTH_CHARGES']
    }),
    getChargeById: builder.query({
      query: (id) => `booth-charges/${id}`,
      providesTags: ['BOOTH_CHARGES']
    }),
    createCharge: builder.mutation({
      query: (charge) => ({
        url: 'booth-charges/',
        method: 'POST',
        body: charge
      }),
      invalidatesTags: ['BOOTH_CHARGES', 'VENDORS']
    }),
    updateCharge: builder.mutation({
      query: ({ id, ...charge }) => ({
        url: `booth-charges/${id}`,
        method: 'PUT',
        body: charge
      }),
      invalidatesTags: ['BOOTH_CHARGES', 'VENDORS']
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `booth-charges/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['BOOTH_CHARGES', 'VENDORS']
    }),
    // Payment endpoints
    createPayment: builder.mutation({
      query: (payment) => ({
        url: 'vendor-payments/',
        method: 'POST',
        body: payment
      }),
      invalidatesTags: ['VENDORS']
    }),
    updatePayment: builder.mutation({
      query: ({ id, ...payment }) => ({
        url: `vendor-payments/${id}/`,
        method: 'PUT',
        body: payment
      }),
      invalidatesTags: ['VENDORS']
    }),
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `vendor-payments/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['VENDORS']
    }),
    // Balance Payment endpoints
    createBalancePayment: builder.mutation({
      query: (payment) => ({
        url: 'balance-payments/',
        method: 'POST',
        body: payment
      }),
      invalidatesTags: ['VENDORS']
    }),
    updateBalancePayment: builder.mutation({
      query: ({ id, ...payment }) => ({
        url: `balance-payments/${id}/`,
        method: 'PUT',
        body: payment
      }),
      invalidatesTags: ['VENDORS']
    }),
    deleteBalancePayment: builder.mutation({
      query: (id) => ({
        url: `balance-payments/${id}/`,
        method: 'DELETE'
      }),
      invalidatesTags: ['VENDORS']
    }),
    updateVendorProfile: builder.mutation({
      query: (data) => ({
        url: 'vendors/profile/',
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['VENDORS']
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: 'auth/change-password/',
        method: 'POST',
        body: data
      })
    }),
  }),

})

export const {
  useGetUserQuery,
  useChangeMyPasswordMutation,
  useLoginMutation,
  useSignOutMutation,
  useGetVendorsQuery,
  useAddVendorMutation,
  useGetVendorByIdQuery,
  useGetVendorByUserQuery,
  useResetVendorPasswordMutation,
  useGetVendorMonthlyReportQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetSettingsQuery,
  useGetSettingByKeyQuery,
  useUpdateSettingByKeyMutation,
  useGetAllChargesQuery,
  useGetVendorChargesQuery,
  useGetChargeByIdQuery,
  useCreateChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useUpdateVendorBalanceMutation,
  useCreateBalancePaymentMutation,
  useUpdateBalancePaymentMutation,
  useDeleteBalancePaymentMutation,
  useUpdateVendorProfileMutation,
  useUpdatePasswordMutation,
} = Api
