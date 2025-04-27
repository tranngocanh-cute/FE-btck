import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkAuth } from '../../api/config';
import { CircularProgress, Box } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, refreshSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const isAdmin = user?.roles?.includes('ADMIN');

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Only attempt to refresh if there's a token but not authenticated yet
        if (!isAuthenticated && checkAuth()) {
          console.log('[AdminRoute] Attempting to refresh token');
          // Use AuthContext's refreshSession instead of direct refreshAccessToken
          const refreshSuccessful = await refreshSession();
          
          if (refreshSuccessful) {
            console.log('[AdminRoute] Token refresh successful');
            setAuthenticated(true);
          } else {
            console.log('[AdminRoute] Token refresh failed');
            setAuthenticated(false);
          }
        } else {
          console.log('[AdminRoute] Using current auth state:', isAuthenticated);
          setAuthenticated(isAuthenticated);
        }
      } catch (error) {
        console.error('[AdminRoute] Error during auth verification:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated, refreshSession]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated) {
    return <Navigate to="/signin" state={{ from: window.location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AdminRoute; 