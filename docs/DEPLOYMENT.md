# Deployment Guide

## 🚀 Overview

This guide covers various deployment strategies for LLM-LAB, from simple single-server deployments to scalable cloud architectures.

## 📋 Pre-Deployment Checklist

### **Environment Preparation**
- [ ] Production environment variables configured
- [ ] API keys and secrets secured
- [ ] Database backup strategy established
- [ ] SSL certificates obtained
- [ ] Domain name configured
- [ ] Monitoring and logging set up

### **Security Checklist**
- [ ] JWT secrets are strong and unique
- [ ] API keys stored securely (not in code)
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enabled
- [ ] Security headers configured

### **Performance Checklist**
- [ ] Production build optimized
- [ ] Caching strategy implemented
- [ ] Database indexes created
- [ ] CDN configured for static assets
- [ ] Compression enabled
- [ ] Error tracking configured

## 🔧 Production Configuration

### **Environment Variables**

#### **Backend Production (.env.production)**
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://username:password@localhost:5432/llm_lab_prod
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=30000

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESS=true

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/llm-lab/app.log
LOG_MAX_SIZE=50MB
LOG_MAX_FILES=10

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# LLM APIs
OPENAI_API_KEY=your-production-openai-key
ANTHROPIC_API_KEY=your-production-anthropic-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# SSL
HTTPS_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem

# Performance
CLUSTER_MODE=true
WORKER_PROCESSES=4
```

#### **Frontend Production (.env.production)**
```bash
# API Configuration
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_WS_URL=wss://api.your-domain.com

# Application
REACT_APP_APP_NAME=LLM Lab
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Features (Enable only what you need)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_TRACKING=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
REACT_APP_HOTJAR_ID=your-hotjar-id

# Error Tracking
REACT_APP_SENTRY_DSN=your-frontend-sentry-dsn

# CDN (if using)
REACT_APP_CDN_URL=https://cdn.your-domain.com
```

## 🐳 Docker Deployment

### **Multi-Stage Dockerfile**

#### **Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]
```

#### **Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

FROM nginx:alpine AS production

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy SSL certificates (if using)
COPY ssl/ /etc/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### **Docker Compose (Production)**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: llm_lab_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/llm_lab_prod
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### **Deployment Commands**
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployments

### **AWS Deployment**

#### **Using AWS ECS with Fargate**

**1. Create ECS Cluster**
```bash
# Install AWS CLI and configure
aws configure

# Create cluster
aws ecs create-cluster --cluster-name llm-lab-cluster
```

**2. Task Definition (task-definition.json)**
```json
{
  "family": "llm-lab-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/llm-lab-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:llm-lab/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/llm-lab",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

**3. Deploy to ECS**
```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster llm-lab-cluster \
  --service-name llm-lab-service \
  --task-definition llm-lab-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

#### **Using AWS Elastic Beanstalk**

**1. Prepare Application**
```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init llm-lab --region us-east-1 --platform node.js

# Create environment
eb create production-env --database.engine postgres --database.username llmlab
```

**2. Configuration (.ebextensions/01-nodecommand.config)**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.17.0
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    NPM_USE_PRODUCTION: true
```

**3. Deploy**
```bash
eb deploy
```

### **Google Cloud Platform (GCP)**

#### **Using Cloud Run**

**1. Build and Push Image**
```bash
# Configure gcloud
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/PROJECT-ID/llm-lab-backend ./backend
docker push gcr.io/PROJECT-ID/llm-lab-backend

docker build -t gcr.io/PROJECT-ID/llm-lab-frontend ./frontend
docker push gcr.io/PROJECT-ID/llm-lab-frontend
```

**2. Deploy to Cloud Run**
```bash
# Deploy backend
gcloud run deploy llm-lab-backend \
  --image gcr.io/PROJECT-ID/llm-lab-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10

# Deploy frontend
gcloud run deploy llm-lab-frontend \
  --image gcr.io/PROJECT-ID/llm-lab-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### **Vercel + Railway Deployment**

#### **Frontend (Vercel)**

**1. vercel.json**
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
    "REACT_APP_API_URL": "@api_url"
  }
}
```

**2. Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### **Backend (Railway)**

**1. railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 2,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**2. Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🌐 Reverse Proxy Configuration

### **Nginx Configuration**

#### **nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
        # Add more backend instances for load balancing
        # server backend2:5000;
        # server backend3:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend server
    server {
        listen 80;
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL certificates
        ssl_certificate /etc/ssl/certs/your-cert.pem;
        ssl_certificate_key /etc/ssl/private/your-key.pem;

        # Security headers
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend static files
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Health check
        location /health {
            proxy_pass http://backend/api/health;
            access_log off;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### **Apache Configuration (Alternative)**

#### **.htaccess**
```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API proxy
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Cache control
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

## 📊 Monitoring and Logging

### **Application Monitoring**

#### **PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# PM2 configuration (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'llm-lab-backend',
    script: './src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=1024'
  }]
};

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **Health Checks**
```javascript
// backend/healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  timeout: 3000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.on('error', () => {
  process.exit(1);
});

req.end();
```

### **Log Management**

#### **Winston Logger Configuration**
```javascript
// backend/src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'llm-lab' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 50 * 1024 * 1024,
      maxFiles: 10
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### **Error Tracking (Sentry)**

#### **Backend Integration**
```javascript
// backend/src/middleware/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

module.exports = Sentry;
```

#### **Frontend Integration**
```javascript
// frontend/src/utils/sentry.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});

export default Sentry;
```

## 🔧 Maintenance and Updates

### **Automated Deployments**

#### **GitHub Actions (CI/CD)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Your deployment script here
          echo "Deploying to production..."
          
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### **Database Migrations**
```bash
# Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npm run db:migrate

# Verify migration
npm run db:verify
```

### **Zero-Downtime Deployment**
```bash
# Using PM2
pm2 start ecosystem.config.js --update-env
pm2 reload all --update-env

# Using Docker (blue-green deployment)
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

## 📈 Performance Optimization

### **Caching Strategy**

#### **Redis Cache**
```javascript
// backend/src/utils/cache.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cache = {
  get: async (key) => {
    return await client.get(key);
  },
  set: async (key, value, ttl = 3600) => {
    return await client.setex(key, ttl, JSON.stringify(value));
  },
  del: async (key) => {
    return await client.del(key);
  }
};

module.exports = cache;
```

### **CDN Configuration**

#### **CloudFlare Example**
```javascript
// Caching rules for static assets
const cacheRules = {
  "*.js": "cache everything for 1 year",
  "*.css": "cache everything for 1 year", 
  "*.png|*.jpg|*.gif": "cache everything for 1 year",
  "/api/*": "bypass cache",
  "/*": "cache HTML for 1 hour"
};
```

### **Database Optimization**
```sql
-- Add indexes for performance
CREATE INDEX idx_experiments_user_id ON experiments(user_id);
CREATE INDEX idx_responses_experiment_id ON responses(experiment_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);
CREATE INDEX idx_quality_metrics_response_id ON quality_metrics(response_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM experiments WHERE user_id = $1;
```

## 🔐 Security Best Practices

### **Security Headers**
```javascript
// backend/src/middleware/security.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### **API Security**
```javascript
// Rate limiting per user
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);
```

---

**Deployment complete! 🚀 Your LLM-LAB is now production-ready!**
