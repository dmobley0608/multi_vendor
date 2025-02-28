import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    name:null,
    is_logged_in :false,
    is_staff :null,
    email:null
}

export const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        setUser:(state, {payload})=>{
            state.name = payload.name
            state.is_logged_in = true
            state.email =payload.email
            state.is_staff = payload.is_staff
        },
        signOut:(state)=>{

            state.is_logged_in = false
            state.name = null
            state.email = null
            state.is_staff = null
            localStorage.removeItem('token')
        }
    }
})

export const {setUser, signOut} = userSlice.actions
export default userSlice.reducer