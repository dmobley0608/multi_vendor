import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiBaseUrl = 'https://hu.tccs.tech/api/'

const getTokenKey = () => {
  if (!localStorage.getItem('token')) {
    return null;
  }
  return localStorage.getItem('token');
};
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

const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getTokenKey();
    if (token) {
      headers.set('Authorization', `Token ${token}`);
    }
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken)
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
      query: () => '/messages/staff/',
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
