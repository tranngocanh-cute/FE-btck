import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Link as MuiLink, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Auth.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    try {
      console.log('Attempting to signup with:', formData);
      await signup(formData.name, formData.email, formData.password);
      console.log('Signup successful');
      
      // Logout the user (since we want them to explicitly login)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page after successful signup
      navigate('/signin', { state: { registrationSuccess: true, email: formData.email } });
    } catch (err) {
      console.error('Signup error:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Network error. Please check your connection or try again later.');
        } else if (err.response?.status === 400) {
          setError('Invalid data. Please check your information and try again.');
        } else if (err.response?.status === 409) {
          setError('Email already exists. Please use a different email or sign in.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
            Sign up
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isLoading}
            />
            
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
              {isLoading ? 'Signing up...' : 'Register'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Already have an account? {' '}
                <MuiLink component={RouterLink} to="/signin" underline="hover">
                  Sign in here
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default SignUp; 