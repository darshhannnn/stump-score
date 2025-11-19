import React, { useState } from 'react';
import { Button, Card, Typography, Box } from '@mui/material';
import axios from 'axios';

const TestRazorpay = () => {
  const [loading, setLoading] = useState(false);

  const handleTestPayment = async () => {
    try {
      setLoading(true);
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      // Create order
      const { data } = await axios.post('/api/payment/test-order', {
        amount: 100, // Rs. 1
        currency: 'INR'
      });

      const options = {
        key: 'rzp_test_aWZEdMdEHsxHCg', // Direct key instead of env variable
        amount: data.amount,
        currency: data.currency,
        name: 'StumpScore Test',
        description: 'Test Payment',
        order_id: data.id,
        handler: async (response) => {
          console.log('Payment success:', response);
          // Verify payment
          const result = await axios.post('/api/payment/verify', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          if (result.data.success) {
            alert('Payment verified successfully!');
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2196f3'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        alert('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, m: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Test Razorpay Integration</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">Test Card Details:</Typography>
        <Typography>Number: 4111 1111 1111 1111</Typography>
        <Typography>Expiry: Any future date</Typography>
        <Typography>CVV: Any 3 digits</Typography>
        <Typography>OTP: 1111</Typography>
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleTestPayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Test ₹1 Payment'}
      </Button>
    </Card>
  );
};

export default TestRazorpay;
