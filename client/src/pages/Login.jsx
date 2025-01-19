import React, { useCallback, useEffect } from 'react'
import LoginForm from '../components/forms/LoginForm'
import { setUser } from '../redux/UserSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useGetUserQuery } from '../services/Api'

const Login = () => {

  return (
    <div className="d-flex flex-column min-vh-100 align-items-center justify-content-center">
      <h3>Please Login</h3>
        <LoginForm />
    </div>
  )
}

export default Login
