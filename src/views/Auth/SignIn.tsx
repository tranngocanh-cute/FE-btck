import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Link as MuiLink, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Auth.css';

interface LocationState {
  registrationSuccess?: boolean;
  email?: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user came from registration
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.registrationSuccess) {
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      if (state.email) {
        setFormData(prev => ({
          ...prev,
          email: state.email || ''
        }));
      }
      
      // Clear the state to prevent showing notification again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      console.log('Attempting to login with:', formData);
      await login(formData.email, formData.password);
      console.log('Login successful');
      
      // Redirect to home page after successful login
      navigate('/', { state: { loginSuccess: true } });
    } catch (err) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection or try again later.');
        } else if (err.response?.status === 401) {
          setError('Invalid email or password.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Please check your credentials.');
        } else if (err.response?.status === 404) {
          setError('Service not found. Please try again later.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container maxWidth="sm">
        <Box className="auth-form-container">
          <Typography variant="h3" component="h1" align="center" gutterBottom>
            Sign in
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isLoading}
            />
            
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2, borderRadius: '20px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account? {' '}
                <MuiLink component={RouterLink} to="/signup" underline="hover">
                  Sign up here
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default SignIn; 