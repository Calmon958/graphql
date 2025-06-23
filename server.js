const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://01.kood.tech'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Test endpoints - MUST be defined BEFORE static file middleware
app.get('/test', (req, res) => {
  console.log('Test GET endpoint hit');
  res.json({ message: 'Test endpoint is working' });
});

app.post('/test-post', (req, res) => {
  console.log('Test POST endpoint hit');
  res.json({ 
    message: 'POST test endpoint is working', 
    receivedData: req.body 
  });
});

// Direct login endpoint
app.post('/api/try-login', async (req, res) => {
  try {
    console.log('Received login request at /api/try-login');
    console.log('Request body:', req.body);
    
    const username = req.body.username || '';
    const password = req.body.password || '';
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    console.log(`Attempting login for user: ${username}`);
    
    // For testing, just return success
    return res.json({
      success: true,
      message: 'Login successful (test mode)',
      token: 'test-token-123'
    });
  } catch (error) {
    console.error('Login attempt error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files AFTER defining API routes
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Proxy API requests to Zone01 backend - AFTER defining direct API routes
app.use('/api', createProxyMiddleware({
  target: 'https://learn.zone01kisumu.ke',
  changeOrigin: true,
  secure: false,
  followRedirects: true,
  pathRewrite: {
    '^/api': '' // Remove the /api prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} request to: ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    
    // If it's a POST request with a body, we need to restream the body
    if (req.method === 'POST' && req.body) {
      let bodyData;
      
      // Handle different content types
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        bodyData = JSON.stringify(req.body);
      } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        // For form data, convert to URL encoded string
        const formData = new URLSearchParams();
        for (const key in req.body) {
          formData.append(key, req.body[key]);
        }
        bodyData = formData.toString();
      } else {
        bodyData = JSON.stringify(req.body);
      }
      
      console.log('Forwarding request body:', bodyData);
      
      // Update content-length header
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      // Write body to request
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  }
}));

// Fallback route for SPA - MUST be AFTER all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
