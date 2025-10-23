import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { checkProfileCompletion } from '../../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'location:', location.pathname);

  useEffect(() => {
    // Temporarily disabled checkProfileCompletion to prevent infinite loading loop
    // if (isAuthenticated && !isLoading) {
    //   dispatch(checkProfileCompletion());
    // }
  }, [isAuthenticated, isLoading, dispatch]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: Redirecting to login via useEffect');
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    console.log('ProtectedRoute: Showing loading state');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading MalPay...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, showing loading while redirecting');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  // Check if user needs to complete profile
  if (user && !user.isEmailVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
