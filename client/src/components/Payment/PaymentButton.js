import React from 'react';
import axios from 'axios';
import { Button } from '@mui/material';

const PaymentButton = ({ amount, onSuccess }) => {
  const handlePayment = async () => {
    try {
      const { data } = await axios.post('/api/payment/create-order', { amount });
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: 'StumpScore Premium',
        description: 'Premium Subscription',
        handler: async (response) => {
          const result = await axios.post('/api/payment/verify', response);
          if (result.data.success) {
            onSuccess();
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handlePayment}
    >
      Upgrade to Premium
    </Button>
  );
};

export default PaymentButton;
