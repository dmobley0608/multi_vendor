import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    loading:false
}

export const loaderSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        setLoadingTrue:(state)=>{
            state.loading = true

        },
        setLoadingFalse:(state)=>{
            state.loading = false

        }
    }
})

export const {setLoadingTrue, setLoadingFalse} = loaderSlice.actions
export default loaderSlice.reducer