import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/signup', formData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth
        required
        name="name"
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        margin="normal"
      />
      <TextField
        fullWidth
        required
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        margin="normal"
      />
      <TextField
        fullWidth
        required
        name="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        margin="normal"
      />
      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
      </Button>
    </Box>
  );
};

export default Signup;