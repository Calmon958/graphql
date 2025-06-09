const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static('.'));

// Proxy API requests
app.use('/api', createProxyMiddleware({
  target: 'https://learn.zone01kisumu.ke',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the request
    console.log(`Proxying request to: ${req.method} ${proxyReq.path}`);
  }
}));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Use http://localhost:${port}/api/auth/signin for authentication`);
  console.log(`Use http://localhost:${port}/api/graphql-engine/v1/graphql for GraphQL queries`);
});