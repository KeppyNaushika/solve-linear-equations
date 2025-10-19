module.exports = {
  apps: [
    {
      name: 'solve-linear-equations',
      script: 'npm',
      args: 'start',
      cwd: '/home/keppy/dev/solve-linear-equations',
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
