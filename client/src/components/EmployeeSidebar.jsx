import React, { useEffect, useState } from 'react'
import { Badge, Button, Nav, NavItem, Stack } from 'react-bootstrap'
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router'
import { useGetUserQuery, useSignOutMutation } from '../services/Api'
import { useGetMessagesQuery } from '../services/MessageApi'
import UnreadMessageBadge from './messages/UnreadMessageBadge'

export default function EmployeeSidebar() {
    const [signout] = useSignOutMutation()
    const [searchParams, setSearchParams] = useSearchParams()
    const nav = useNavigate()
    console.log(searchParams.get('sidebar'))
    if(searchParams.get('sidebar') === 'false') return ''

  return (
    <Stack gap={3} variant='dark' className='bg-dark min-vh-100 p-1 no-print'>
        <NavLink to='cash-register'>Cash Register</NavLink>
        <NavLink to='vendors'>Vendors</NavLink>
        <NavLink to='reports'>Reports</NavLink>
        <NavLink to='messages'>Messages <UnreadMessageBadge/></NavLink>
        <NavLink to='profile'>Profile</NavLink>
        <Button variant='danger' size='md' onClick={()=>{signout(); nav('/login')}}> Sign Out</Button>
    </Stack>
  )
}
