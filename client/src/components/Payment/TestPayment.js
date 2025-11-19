import React from 'react';
import { Card, Typography, Button, Box } from '@mui/material';
import axios from 'axios';

const TestPayment = () => {
  const handleTestPayment = async () => {
    try {
      const { data } = await axios.post('/api/payment/test-payment');
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: 'StumpScore Test Payment',
        description: 'Test Premium Subscription',
        handler: async (response) => {
          console.log('Payment success:', response);
          alert('Test payment successful!');
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Test payment error:', error);
    }
  };

  return (
    <Card sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>Test Payment Integration</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">Test Card Details:</Typography>
        <Typography>Number: 4111 1111 1111 1111</Typography>
        <Typography>Expiry: Any future date</Typography>
        <Typography>CVV: Any 3 digits</Typography>
        <Typography>Name: Any name</Typography>
        <Typography>OTP: 1111</Typography>
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleTestPayment}
      >
        Test Payment (₹499)
      </Button>
    </Card>
  );
};

export default TestPayment;
