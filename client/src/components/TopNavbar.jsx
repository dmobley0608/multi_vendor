import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/esm/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { useNavigate } from 'react-router';

import { useGetUserQuery, useLazyGetUserQuery, useSignOutMutation } from '../services/UserApi';
import { useEffect } from 'react';

function TopNavbar() {

  const {data:user, isLoading, error} = useGetUserQuery()
  const [signOut] = useSignOutMutation()
  const nav = useNavigate()


  const logout = async () => {
    signOut()
    nav('/login')
  }

  return (
    <Navbar expand="lg" className="">
      <Container>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto w-100">
            {user && !error ?
              <Button variant='outline-danger' size='sm' className='ms-auto' onClick={logout}>Signout</Button>
              :
              <></>
            }
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;