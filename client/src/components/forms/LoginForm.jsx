import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLazyGetUserQuery, useLoginMutation } from '../../services/UserApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/UserSlice';
import { setLoadingFalse, setLoadingTrue } from '../../redux/LoadingSlice';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router';

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [triggerLogin, {isLoading}] = useLoginMutation()
  const [checkUser, result] = useLazyGetUserQuery()
  const nav = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    const res = await triggerLogin(credentials)
    if (res?.data) {
      localStorage.setItem('token', res.data.token)
      await checkUser()
      nav('/')
    }
    if (res?.error) {
      setError("Invalid Credentials")
    }
  }

  useEffect(() => { }, [error])
  return (
    <Form id='loginForm' className='text-start' onSubmit={login} >
      <small className='text-danger'>{error}</small>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" onChange={({ target }) => setCredentials({ ...credentials, email: target.value })} />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" autoComplete='current-password' onChange={({ target }) => setCredentials({ ...credentials, password: target.value })} />
      </Form.Group>
      <Button variant="primary" type="submit" disabled={isLoading}>
        Submit <span>{isLoading && <Spinner size='sm'/>}</span>
      </Button>
    </Form>
  );
}

export default LoginForm;