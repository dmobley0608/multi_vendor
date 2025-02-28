import React from 'react'
import {  Button, Stack } from 'react-bootstrap'
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router'

import UnreadMessageBadge from './messages/UnreadMessageBadge'
import { useAuth } from '../context/authContext'


export default function EmployeeSidebar() {
    const [searchParams, setSearchParams] = useSearchParams()
    const nav = useNavigate()
    const auth = useAuth()
    if(searchParams.get('sidebar') === 'false') return ''

  return (
    <Stack gap={3} variant='dark' className='bg-dark min-vh-100 p-1 text-start px-3'>
        <NavLink to='dashboard'>Dashboard</NavLink>
        <NavLink to='cash-register'>Checkout</NavLink>
        <NavLink to='transactions'>Transactions</NavLink>
        <NavLink to='vendors' className='border-top border-bottom py-3'>Vendors</NavLink>
        <NavLink to='top-10' className=''>Top 10</NavLink>
        <NavLink to='monthly-sales-summary'>Monthly Sales Summary</NavLink>
        <NavLink to='messages'>Messages <UnreadMessageBadge/></NavLink>
        <NavLink to='settings'>Settings</NavLink>
        <Button variant='outline-danger' size='md' onClick={()=>{auth.logout()}}> Sign Out</Button>
    </Stack>
  )
}
