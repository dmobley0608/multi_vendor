import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

const getTokenKey =()=>{
    if(!localStorage.getItem('token')){
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




export const UserApi = createApi({
    reducerPath:'userApi',
    baseQuery:fetchBaseQuery({
        baseUrl:`${import.meta.env.VITE_API_URL}/user/`,
        prepareHeaders:(headers, {getState})=>{
            const token = getTokenKey()
            if(token){
                headers.set('Authorization', `Token ${token}`)

            }
            const csrfToken = getCookie('csrftoken');
            if(csrfToken){
                headers.set('X-CSRFToken', csrfToken)
            }
            return headers
        }
    }),
    tagTypes:['USER'],
    endpoints:(builder)=>({
        getUser:builder.query({
            query:()=>'me/',
            providesTags:['USER']
        }),
        createUser:builder.mutation({
            query:(body)=>({
                url:'create/',
                method:'post',
                body:body
            }),
            invalidatesTags:['USERS']
        }),
        updateUser:builder.mutation({
            query:(body)=>({
                url:`me/`,
                method:'put',
                body:body
            }),
            invalidatesTags:['USERS']
        }),
        login:builder.mutation({
            query:(body)=>({
                url:'token/',
                method:'post',
                body:body,
            }),
        }),
        signOut:builder.mutation({
            queryFn:()=>{
                localStorage.clear();
                return []
            },
            invalidatesTags:['USER']
        })
    })
})

export const {useCreateUserMutation,useLoginMutation,useGetUserQuery, useLazyGetUserQuery, useSignOutMutation,useUpdateUserMutation} = UserApi