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

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: baseQuery,
  tagTypes: ['Messages'],
  endpoints: (builder) => ({
    getMessages: builder.query({
      query: () => '/messages',
      providesTags: ['Messages'],
    }),
    getStaff: builder.query({
      query: () => 'messages/staff/',
      providesTags: ['Staff'],
    }),
    createMessage: builder.mutation({
      query: (message) => ({
        url: '/messages/',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Messages'],
    }),
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/messages/${messageId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Messages'],
    }),
    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `/messages/${messageId}/read/`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const { useGetMessagesQuery, useCreateMessageMutation, useDeleteMessageMutation, useMarkMessageAsReadMutation, useGetStaffQuery } = messageApi;
