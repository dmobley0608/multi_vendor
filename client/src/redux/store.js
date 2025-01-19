import { configureStore } from '@reduxjs/toolkit'
import { UserApi } from '../services/UserApi'
import userReducer from './UserSlice'
import loaderReducer from './LoadingSlice'
import { VendorApi } from '../services/VendorApi'
import { transactionApi } from '../services/TransactionApi'
import { messageApi } from '../services/MessageApi'

export const store = configureStore({
  reducer: {
    loader:loaderReducer,
    user:userReducer,
    [UserApi.reducerPath]:UserApi.reducer,
    [VendorApi.reducerPath]:VendorApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
  },

  middleware:(defaultMiddleware)=>
    defaultMiddleware().concat(UserApi.middleware).concat(VendorApi.middleware).concat(transactionApi.middleware).concat(messageApi.middleware)
})