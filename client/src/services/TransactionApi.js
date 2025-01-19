import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getTokenKey = () => {
  if (!localStorage.getItem('token')) {
    return null;
  }
  return localStorage.getItem('token');
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL}/`,
  prepareHeaders: (headers, { getState }) => {
    const token = getTokenKey();
    if (token) {
      headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  },
});

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ vendor = '', item = '', dateRange = { start: '', end: '' } } = {}) => ({
        url: 'transactions',
        params: { vendor, item, start: dateRange.start, end: dateRange.end },
      }),
    }),
    getTopVendors: builder.query({
      query: () => 'top-vendors',
    }),
    getTopItems: builder.query({
      query: () => 'top-items',
    }),
    getTransactionById: builder.query({
      query: (id) => `transactions/${id}`,
    }),
    createTransaction: builder.mutation({
      query: (transaction) => ({
        url: '/transactions/',
        method: 'POST',
        body: transaction,
      }),
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...transaction }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: transaction,
      }),
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useLazyGetTransactionsQuery,
  useGetTopVendorsQuery,
  useGetTopItemsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
