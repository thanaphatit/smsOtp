# Deployment Guide — SMS OTP Verification

## Overview

This is a client-side Vue 3 application that integrates with the **Bling Innovation OTP Service API v2.1**.

**Critical constraint:** The Bling API does **not** support CORS (Cross-Origin Resource Sharing). This means you cannot call the Bling API directly from a browser in production. You must use one of the approaches below.

---

## Option 1: Static Demo (Mock Mode)

For a static demo/preview that works without a backend:
1. Ensure `.env` has `VITE_MOCK_MODE=true`
2. Build: `npm run build`
3. Deploy the `dist/` folder to any static web server

The mock mode accepts test PIN `123456` for verification.

---

## Option 2: Production with Backend Proxy (Recommended)

### Architecture

```
Browser (your app) → Your Backend Proxy → Bling API
```

Your backend proxy server:
1. Receives POST requests from the browser
2. Forwards the request to `https://v2.blingsms.com/gw/api.php`
3. Passes through the Authorization header and form-data body
4. Returns the Bling API response back to the browser

### Steps

1. **Set up a backend proxy** — Example using Node.js/Express:

```js
// proxy-server.js
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/proxy/otp', async (req, res) => {
  const response = await fetch('https://v2.blingsms.com/gw/api.php', {
    method: 'POST',
    headers: {
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(req.body).toString(),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3001);
```

2. **Configure environment:**
   - Copy `.env.production` to `.env` (or set server env vars)
   - Set `VITE_MOCK_MODE=false`
   - Set `VITE_API_PROXY_URL=https://your-server.com/proxy/otp`
   - Replace `VITE_OTP_APP_KEY` and `VITE_OTP_APP_SECRET` with real credentials

3. **Build:**
   ```bash
   npm run build
   ```

4. **Deploy:**
   - Serve the `dist/` folder from your web server (e.g., Nginx, Apache)
   - Ensure API proxy URL is correctly configured

---

## Option 3: Production without Proxy (Nginx Reverse Proxy)

If you use Nginx to serve the app, you can configure it to proxy API requests:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Bling (bypass CORS)
    location /api/otp/ {
        proxy_pass https://v2.blingsms.com/gw/api.php;
        proxy_set_header Host v2.blingsms.com;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }
}
```

Then set `VITE_API_PROXY_URL=/api/otp/` in your `.env.production`.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | No | Bling API endpoint (default: `https://v2.blingsms.com/gw/api.php`) |
| `VITE_OTP_APP_KEY` | Yes | OTP App Key from Bling OTP Service menu |
| `VITE_OTP_APP_SECRET` | Yes | OTP App Secret from Bling OTP Service menu |
| `VITE_MOCK_MODE` | No | Set `true` for demo/testing without real SMS (default: `true`) |
| `VITE_API_PROXY_URL` | No | Backend proxy URL for production CORS bypass |

---

## Build Output

```
dist/
  index.html
  assets/
    index-xxxxx.css
    index-xxxxx.js
    vendor-xxxxx.js
```

All static files include content hashes for cache busting.