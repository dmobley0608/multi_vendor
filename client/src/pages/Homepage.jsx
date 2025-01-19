import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useLazyGetUserQuery } from '../services/Api'


export default function Homepage({user}) {

    const [checkUser] = useLazyGetUserQuery()
    const nav = useNavigate()

    useEffect(()=>{

        if(user?.is_staff){
            nav('/staff/cash-register')
        }else if(user && !user.is_staff){
              nav('/vendor')
        }else{
            nav('/login')
        }


    },[])
  return (
    <div>

    </div>
  )
}
