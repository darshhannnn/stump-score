import React from 'react';
import { Card, Typography, Button } from '@mui/material';
import PaymentButton from '../Payment/PaymentButton';

const PremiumPlan = () => {
  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <Card sx={{ p: 3, maxWidth: 400, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Premium Subscription
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        ₹499/month
      </Typography>
      <Typography variant="body1" paragraph>
        Get access to all premium features
      </Typography>
      <PaymentButton 
        amount={499}
        onSuccess={handleSuccess}
      />
    </Card>
  );
};

export default PremiumPlan;
