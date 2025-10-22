# 🚀 MalPay Web Application Deployment Guide

This guide covers deploying the MalPay web application to various platforms with production-ready configurations.

## 📋 Prerequisites

- Node.js 16+ installed
- Backend API deployed and accessible
- Domain name (optional)
- SSL certificate (for production)

## 🔧 Environment Configuration

### Production Environment Variables
Create a `.env.production` file:

```env
# API Configuration
REACT_APP_API_URL=https://api.malpay.com/api/v1

# Environment
REACT_APP_ENV=production

# App Configuration
REACT_APP_NAME=MalPay
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG=false

# Blockchain Configuration
REACT_APP_DEFAULT_NETWORK=tron
REACT_APP_SUPPORTED_NETWORKS=tron,polygon,ethereum

# Currency Configuration
REACT_APP_DEFAULT_CURRENCY=NGN
REACT_APP_SUPPORTED_CURRENCIES=NGN,USD,EUR

# Security
REACT_APP_ENABLE_2FA=true
REACT_APP_ENABLE_BIOMETRIC=true

# UI Configuration
REACT_APP_DEFAULT_THEME=light
REACT_APP_ENABLE_DARK_MODE=true
```

## 🏗️ Build Process

### 1. Install Dependencies
```bash
cd frontend-web
npm ci --production=false
```

### 2. Type Checking
```bash
npm run type-check
```

### 3. Linting
```bash
npm run lint
```

### 4. Testing
```bash
npm test -- --coverage --watchAll=false
```

### 5. Production Build
```bash
npm run build
```

The build process will create an optimized production build in the `build/` directory.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Setup
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

#### Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://api.malpay.com/api/v1"
  }
}
```

### Option 2: Netlify

#### Setup
1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod --dir=build
```

#### Configuration
Create `netlify.toml`:
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://api.malpay.com/api/v1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: AWS S3 + CloudFront

#### Setup
1. Install AWS CLI:
```bash
pip install awscli
```

2. Configure AWS:
```bash
aws configure
```

3. Create S3 bucket:
```bash
aws s3 mb s3://malpay-web-app
```

4. Upload build:
```bash
aws s3 sync build/ s3://malpay-web-app --delete
```

5. Configure CloudFront for HTTPS and caching.

### Option 4: Railway

#### Setup
1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Deploy:
```bash
railway deploy
```

#### Configuration
Create `railway.toml`:
```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npx serve -s build -l 3000"
  healthcheckPath = "/"
  healthcheckTimeout = 100
  restartPolicyType = "on_failure"

[env]
  REACT_APP_API_URL = "https://api.malpay.com/api/v1"
```

## 🔒 Security Configuration

### HTTPS Configuration
Ensure HTTPS is enabled for production:

1. **SSL Certificate**: Use Let's Encrypt or commercial SSL
2. **HSTS Headers**: Enable HTTP Strict Transport Security
3. **CSP Headers**: Configure Content Security Policy

### Security Headers
Add security headers to your deployment:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ]
    }
  ]
}
```

## 📊 Performance Optimization

### Bundle Optimization
The build process automatically optimizes:
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Removes unused code
- **Minification**: Compresses JavaScript and CSS
- **Asset Optimization**: Optimizes images and fonts

### Caching Strategy
Configure caching for optimal performance:

```json
{
  "caching": {
    "static": {
      "maxAge": 31536000
    },
    "dynamic": {
      "maxAge": 0
    }
  }
}
```

### CDN Configuration
Use a CDN for global content delivery:
- **CloudFlare**: Free CDN with security features
- **AWS CloudFront**: Scalable CDN solution
- **Fastly**: High-performance CDN

## 🔍 Monitoring & Analytics

### Error Tracking
Integrate error tracking services:

1. **Sentry**: Real-time error monitoring
2. **LogRocket**: Session replay and error tracking
3. **Bugsnag**: Error monitoring and reporting

### Analytics
Add analytics for user insights:

1. **Google Analytics**: User behavior tracking
2. **Mixpanel**: Event-based analytics
3. **Amplitude**: Product analytics

### Performance Monitoring
Monitor application performance:

1. **Lighthouse CI**: Automated performance testing
2. **WebPageTest**: Performance analysis
3. **GTmetrix**: Performance monitoring

## 🧪 Testing in Production

### Health Checks
Implement health check endpoints:

```javascript
// health-check.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION
  });
});
```

### Smoke Tests
Create smoke tests for critical functionality:

```bash
# Test login functionality
curl -X POST https://malpay.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📱 PWA Configuration

### Service Worker
Enable Progressive Web App features:

```javascript
// serviceWorker.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### Manifest
Create `public/manifest.json`:

```json
{
  "short_name": "MalPay",
  "name": "MalPay - International Money Transfer",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables
```bash
# Check environment variables
echo $REACT_APP_API_URL
```

#### Type Errors
```bash
# Run type checking
npm run type-check
```

#### Lint Errors
```bash
# Fix linting issues
npm run lint:fix
```

### Performance Issues

#### Large Bundle Size
- Use dynamic imports for large components
- Implement code splitting
- Optimize images and assets

#### Slow Loading
- Enable gzip compression
- Use CDN for static assets
- Implement service worker caching

## 📈 Post-Deployment

### Verification Checklist
- [ ] Application loads successfully
- [ ] Authentication works
- [ ] API integration functions
- [ ] Responsive design works
- [ ] Performance metrics are good
- [ ] Security headers are configured
- [ ] SSL certificate is valid
- [ ] Analytics are tracking
- [ ] Error monitoring is active

### Monitoring Setup
1. **Uptime Monitoring**: Set up uptime checks
2. **Performance Monitoring**: Monitor Core Web Vitals
3. **Error Tracking**: Configure error reporting
4. **User Analytics**: Track user behavior

### Maintenance
- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates
- **Performance Reviews**: Regular performance audits
- **User Feedback**: Monitor user feedback

---

**MalPay Web Application** - Deployed and ready for global users! 🌍🚀
