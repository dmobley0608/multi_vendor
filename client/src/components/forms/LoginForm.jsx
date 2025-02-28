import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/authContext';

function LoginForm({onSubmit}) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const auth = useAuth()
  const nav = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    await onSubmit(credentials)
  }

  useEffect(() => { }, [error])
  return (
    <Form id='loginForm' className='text-start' onSubmit={login} >
      <small className='text-danger'>{error}</small>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" autoComplete='username' placeholder="Enter Username" onChange={({ target }) => setCredentials({ ...credentials, username: target.value })} />

      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" autoComplete='current-password' onChange={({ target }) => setCredentials({ ...credentials, password: target.value })} />
      </Form.Group>
      <Button variant="primary" type="submit" >
        Sign In <span></span>
      </Button>
    </Form>
  );
}

export default LoginForm;