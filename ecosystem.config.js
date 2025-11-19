/**
 * PM2 Ecosystem Configuration
 * Process management configuration for production deployment
 */

module.exports = {
  apps: [{
    name: 'stumpscore-api',
    script: './server.js',
    
    // Instances
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5000
    },
    
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart behavior
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Graceful shutdown
    listen_timeout: 10000,
    kill_timeout: 5000,
    wait_ready: true,
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
    
    // Advanced features
    watch: false, // Don't watch files in production
    ignore_watch: ['node_modules', 'logs', 'build'],
    
    // Cron restart (optional - restart daily at 3 AM)
    // cron_restart: '0 3 * * *',
    
    // Source map support
    source_map_support: true,
    
    // Graceful start/shutdown
    shutdown_with_message: true
  }]
};
