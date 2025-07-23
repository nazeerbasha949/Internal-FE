import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import BaseUrl from '../Api.jsx';

const PUBLIC_PATHS = ['/', '/login', '/forgotpassword'];

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Check token validity on every page load and route change
  useEffect(() => {
    const checkTokenValidity = async () => {
      const currentToken = localStorage.getItem('token');
      setToken(currentToken);

      // If on a public path and has valid token, redirect to dashboard
      if (PUBLIC_PATHS.includes(location.pathname) && currentToken) {
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          const data = await res.json();
          
          if (res.ok && data.valid) {
            // Token is valid, redirect to dashboard
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard', { replace: true });
            setLoading(false);
            return;
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Token validation error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsValid(false);
          setLoading(false);
          return;
        }
      }

      // If no token and trying to access protected route, redirect to login
      if (!currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // If token exists and on protected route, validate it
      if (currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          const data = await res.json();
          
          if (res.ok && data.valid) {
            // Token is valid, stay on current page
            localStorage.setItem('user', JSON.stringify(data.user));
            setIsValid(true);
          } else {
            // Token is invalid, clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            navigate('/login', { replace: true });
          }
        } catch (err) {
          console.error('Token validation error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsValid(false);
          navigate('/login', { replace: true });
        }
      } else if (!currentToken && PUBLIC_PATHS.includes(location.pathname)) {
        // No token, but on public path - allow access
        setIsValid(true);
      }
      
      setLoading(false);
    };

    setLoading(true);
    checkTokenValidity();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white/80">
        <CircularProgress size={48} color="primary" />
      </div>
    );
  }

  // For public routes, don't render children (let App.jsx handle them)
  if (PUBLIC_PATHS.includes(location.pathname)) {
    return null;
  }

  // For protected routes, render children if token is valid
  return isValid ? children : null;
};

export default ProtectedRoute; 