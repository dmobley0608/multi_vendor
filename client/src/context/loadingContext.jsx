import React, { createContext, useContext, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Loading...');

    const showLoading = (customMessage = 'Loading...') => {
        setMessage(customMessage);
        setIsLoading(true);
        return Swal.fire({
            title: customMessage,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    };

    const hideLoading = () => {
        setIsLoading(false);
        Swal.close();
    };

    const withLoading = async (action, loadingMessage = 'Loading...') => {
        try {
            await showLoading(loadingMessage);
            await action();
        } finally {
            hideLoading();
        }
    };

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, withLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
