module.exports = {
  apps: [
    {
      name: 'admify-backend',
      script: 'server.js',
      instances: 1, // Set to 'max' for multi-core load-balancing or 1 for single VPS worker
      exec_mode: 'fork', // 'fork' for single worker, 'cluster' for multi-core
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      time: true,
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
    },
  ],
};
