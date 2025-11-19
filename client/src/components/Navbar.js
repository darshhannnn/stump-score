import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* ...existing code... */}
        <Button
          color="inherit"
          component={Link}
          to="/test-payment"
          sx={{ marginLeft: 2 }}
        >
          Test Payment
        </Button>
        {/* ...existing code... */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;