import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          StumpScore
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          {/* Existing nav items */}
          <Button
            color="inherit"
            component={Link}
            to="/test-payment"
            sx={{ ml: 2 }}
          >
            Test Payment
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;