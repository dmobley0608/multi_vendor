import React from 'react'
import { Button, Nav, NavItem, Stack } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router'
import { useSignOutMutation } from '../services/Api'


export default function EmployeeSidebar() {
    const [signout] = useSignOutMutation()
    const nav = useNavigate()
  return (
    <Stack gap={3} variant='dark' className='bg-dark min-vh-100 p-1 no-print'>
        <NavLink to='cash-register'>Cash Register</NavLink>
        <NavLink to='vendors'>Vendors</NavLink>
        <NavLink to='reports'>Reports</NavLink>
        <NavLink to='messages'>Messages</NavLink>
        <NavLink to='profile'>Profile</NavLink>
        <Button variant='danger' size='md' onClick={()=>{signout(); nav('/login')}}> Sign Out</Button>
    </Stack>
  )
}
