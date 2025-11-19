import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PremiumPlan from './components/Subscription/PremiumPlan';
import TestPayment from './components/Payment/TestPayment';
import Profile from './components/Profile/Profile';
import PrivateRoute from './components/PrivateRoute'; // Assuming you have a PrivateRoute component
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import TestRazorpay from './components/Payment/TestRazorpay';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/premium" element={<PremiumPlan />} />
          <Route path="/test-payment" element={<TestRazorpay />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;