import { configureStore } from '@reduxjs/toolkit'
import loaderReducer from './LoadingSlice'

import { transactionApi } from '../services/TransactionApi'
import { messageApi } from '../services/MessageApi'
import { Api } from '../services/Api'

export const store = configureStore({
  reducer: {
    loader:loaderReducer,
    [Api.reducerPath]:Api.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
  },

  middleware:(defaultMiddleware)=>
    defaultMiddleware().concat(Api.middleware).concat(transactionApi.middleware).concat(messageApi.middleware)
})