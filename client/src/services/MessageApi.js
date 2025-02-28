import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    return headers;
  },
});

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: baseQuery,
  tagTypes: ['Messages'],
  endpoints: (builder) => ({

    getUserMessages: builder.query({
      query: () => '/messages/my-messages',
      providesTags: ['Messages'],
    }),
    createMessage: builder.mutation({
      query: (message) => ({
        url: '/messages/',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Messages'],
    }),
    editMessage: builder.mutation({
      query: ({ id, ...changes }) => ({
        url: `/messages/${id}`,
        method: 'PUT',
        body: changes,
      }),
      invalidatesTags: ['Messages'],
    }),
    addReply: builder.mutation({
      query: ({ id, reply }) => ({
        url: `/messages/${id}/reply`,
        method: 'POST',
        body: reply,
      }),
      invalidatesTags: ['Messages'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Messages'],
    }),
    markAsSenderDeleted: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}/sender-delete`,
        method: 'PUT',
      }),
      invalidatesTags: ['Messages'],
    }),
    markAsRecipientDeleted: builder.mutation({
      query: (id) => ({
        url: `/messages/${id}/recipient-delete`,
        method: 'PUT',
      }),
      invalidatesTags: ['Messages'],
    }),
    markReplyAsRead: builder.mutation({
      query: ({ messageId, replyId }) => ({
        url: `/messages/${messageId}/reply/${replyId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const {
  useCreateMessageMutation,
  useGetUserMessagesQuery,
  useEditMessageMutation,
  useAddReplyMutation,
  useMarkAsReadMutation,
  useMarkAsSenderDeletedMutation,
  useMarkAsRecipientDeletedMutation,
  useMarkReplyAsReadMutation
} = messageApi;
