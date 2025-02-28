import React, { useEffect, useState } from 'react'
import LoginForm from '../components/forms/LoginForm'
import { useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/authContext'
import { Alert, Spinner } from 'react-bootstrap'

const Login = () => {
  const auth = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (auth?.user) {
      // Strictly route users based on their role
      const targetPath = auth.user.isStaff ? '/staff/cash-register' : '/vendor';
      nav(targetPath, { replace: true });
    }
  }, [auth?.user, nav]);

  const handleLogin = async (credentials) => {
    setError('');
    setIsLoading(true);

    try {
      await auth.login(credentials);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err?.data?.message ||
        'Unable to connect to server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 align-items-center justify-content-center">
      <h3 className="mb-4">Welcome Back</h3>

      {error && (
        <Alert
          variant="danger"
          className="mb-4 text-center w-100"
          style={{ maxWidth: '400px' }}
          onClose={() => setError('')}
          dismissible
        >
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-2">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="text-muted">Signing you in...</p>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}

export default Login
