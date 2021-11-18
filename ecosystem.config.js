module.exports = {
  apps: [
    {
      name: 'ddns-at-home',
      script: './app/index.js',
      watch: './app',
      env: {
        NODE_ENV: 'development',
        DAEMON: 'pm2'
      },
      env_production: {
        NODE_ENV: 'production',
        DAEMON: 'pm2'
      }
    }
  ],
};
