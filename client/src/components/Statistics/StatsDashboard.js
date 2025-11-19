import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Grid, Typography, CircularProgress } from '@mui/material';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/statistics/user');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Matches</Typography>
          <Typography>Total: {stats?.matches?.total || 0}</Typography>
          <Typography>Live: {stats?.matches?.live || 0}</Typography>
          <Typography>Completed: {stats?.matches?.completed || 0}</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Scoring</Typography>
          <Typography>Total Runs: {stats?.scoring?.totalRuns || 0}</Typography>
          <Typography>Highest Score: {stats?.scoring?.highestScore || 0}</Typography>
          <Typography>Total Wickets: {stats?.scoring?.totalWickets || 0}</Typography>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatsDashboard;
