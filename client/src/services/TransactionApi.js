import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { use } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL + '/api'

const getTokenKey = () => {
  if (!localStorage.getItem('token')) {
    return null;
  }
  return localStorage.getItem('token');
};


const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getTokenKey();
    if (token) {
      headers.set('Authorization', `Token ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQuery,
  tagTypes: ['Transactions'],
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: ({ vendor = '', item = '', dateRange = { start: '', end: '' } } = {}) => ({
        url: 'transactions',
        params: { vendor, item, start: dateRange.start, end: dateRange.end },
      }),
      providesTags: ['Transactions']
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
        url: 'transactions/',
        method: 'POST',
        body: transaction,
      }),
      invalidatesTags: ['Transactions']
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...transaction }) => ({
        url: `transactions/${id}`,
        method: 'PUT',
        body: transaction,
      }),
      invalidatesTags: ['Transactions']
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions']
    }),
    getDailyTransactions: builder.query({
      query: () => 'transactions/today',
      providesTags: ['Transactions']
    }),
    getWeeklyTransactions: builder.query({
      query: () => 'transactions/weekly',
      providesTags: ['Transactions']
    }),
    getMonthlyTransactions: builder.query({
      query: () => 'transactions/monthly',
      providesTags: ['Transactions']
    }),
    updateTransactionItem: builder.mutation({
      query: (data) => ({
        url: `/transactions/items/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Transactions'],
    }),
    deleteTransactionItem: builder.mutation({
      query: (id) => ({
        url: `/transactions/items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions'],
    }),
    getTransactionsByMonth: builder.query({
      query: ({ year, month }) => `transactions/monthly/${year}/${month}`,
      providesTags: ['Transactions']
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetDailyTransactionsQuery,
  useGetWeeklyTransactionsQuery,
  useGetMonthlyTransactionsQuery,
  useLazyGetDailyTransactionsQuery,
  useLazyGetWeeklyTransactionsQuery,
  useLazyGetMonthlyTransactionsQuery,
  useLazyGetTransactionsQuery,
  useGetTopVendorsQuery,
  useGetTopItemsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useUpdateTransactionItemMutation,
  useDeleteTransactionItemMutation,
  useGetTransactionsByMonthQuery,
  useLazyGetTransactionsByMonthQuery,
} = transactionApi;
