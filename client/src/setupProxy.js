const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/api/*', createProxyMiddleware({
    target: 'http://localhost:3001',
    secure: false,
  }));
  app.use('/users/*', createProxyMiddleware({
    target: 'http://localhost:3001',
    secure: false,
  }));
};