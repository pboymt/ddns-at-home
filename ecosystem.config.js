module.exports = {
  apps: [
    {
      name: 'ddns-at-home',
      script: './lib/index.js',
      watch: './lib',
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
