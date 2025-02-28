import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Spinner } from 'react-bootstrap';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserData = async (token) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                credentials: 'include'
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: {
                        message: data.message || data.error || 'Invalid username or password'
                    }
                };
            }

            if (!data.token) {
                throw {
                    status: 400,
                    data: { message: 'No token received from server' }
                };
            }

            localStorage.setItem('token', data.token);
            await fetchUserData(data.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch(`${BASE_URL}/api/auth/logout`);
            localStorage.removeItem('token');
            setUser(null);
            // Navigate without forcing refresh
            window.location.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

const AuthLoader = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Verifying user...</p>
        </div>
    </div>
);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const RequireAuth = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <AuthLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect staff users trying to access vendor routes
    if (user.isStaff && location.pathname.startsWith('/vendor')) {
        return <Navigate to="/staff/cash-register" replace />;
    }

    // Redirect vendor users trying to access staff routes
    if (!user.isStaff && location.pathname.startsWith('/staff')) {
        return <Navigate to="/vendor" replace />;
    }

    return children;
};

export const RequireAdmin = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <AuthLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.isStaff) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
