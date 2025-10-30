# Troubleshooting Guide

## 🔧 Quick Fixes

### **Common Issues**

| Problem | Quick Fix | Details |
|---------|-----------|---------|
| `npm install` fails | Clear cache: `npm cache clean --force` | [Node.js Issues](#nodejs-issues) |
| Port 3000/5000 in use | Kill process: `npx kill-port 3000` | [Port Conflicts](#port-conflicts) |
| Database connection error | Check `.env` file and restart database | [Database Issues](#database-issues) |
| API key errors | Verify keys in `.env` and restart server | [API Key Issues](#api-key-issues) |
| Build failures | Delete `node_modules` and reinstall | [Build Issues](#build-issues) |
| CORS errors | Check frontend/backend URLs match | [CORS Issues](#cors-issues) |

## 🐛 Detailed Troubleshooting

### **Node.js Issues**

#### **Problem: Node Version Incompatibility**
```bash
# Error
Error: The engine "node" is incompatible with this module

# Solution
# Check required version
cat package.json | grep '"node"'

# Install correct version (using nvm)
nvm install 18
nvm use 18

# Or update package.json if using newer version
```

#### **Problem: npm install Failures**
```bash
# Error
npm ERR! peer dep missing: react@^18.0.0

# Solutions
# 1. Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 2. Force peer dependency resolution
npm install --legacy-peer-deps

# 3. Use exact versions
npm install react@18.2.0 react-dom@18.2.0

# 4. Check for conflicting global packages
npm list -g --depth=0
```

#### **Problem: Permission Errors (Windows)**
```cmd
# Error
Error: EACCES: permission denied

# Solutions
# 1. Run as administrator
# Right-click Command Prompt -> Run as administrator

# 2. Change npm prefix
npm config set prefix %APPDATA%\npm

# 3. Use npm with --force flag (last resort)
npm install --force
```

#### **Problem: PATH Issues**
```bash
# Error
'node' is not recognized as an internal or external command

# Solution (Windows)
# Add Node.js to PATH
setx PATH "%PATH%;C:\Program Files\nodejs"

# Solution (macOS/Linux)
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### **Database Issues**

#### **Problem: SQLite Database Lock**
```bash
# Error
SQLITE_BUSY: database is locked

# Solutions
# 1. Kill all Node processes
pkill -f node
# Windows: taskkill /f /im node.exe

# 2. Remove lock files
rm backend/database.sqlite-wal
rm backend/database.sqlite-shm

# 3. Restart with clean database
cd backend
npm run db:reset
```

#### **Problem: Database Schema Mismatch**
```bash
# Error
SQLITE_ERROR: no such column: experiments.newColumn

# Solution
# Run migrations
cd backend
npm run db:migrate

# If migrations fail, reset database
npm run db:reset
npm run db:seed
```

#### **Problem: Database Connection Timeout**
```javascript
// Error in logs
Database connection timeout after 5000ms

// Solution: Update database config
// backend/src/config/database.js
module.exports = {
  development: {
    storage: './database.sqlite',
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,  // Increase from 30000
      idle: 10000
    },
    retry: {
      match: [/SQLITE_BUSY/],
      max: 3
    }
  }
};
```

#### **Problem: Foreign Key Constraint Errors**
```sql
-- Error
FOREIGN KEY constraint failed

-- Solution: Check data integrity
-- 1. Identify orphaned records
SELECT * FROM responses WHERE experiment_id NOT IN (SELECT id FROM experiments);

-- 2. Clean up orphaned records
DELETE FROM responses WHERE experiment_id NOT IN (SELECT id FROM experiments);

-- 3. Rebuild database if needed
npm run db:reset
```

### **API Key Issues**

#### **Problem: OpenAI API Key Invalid**
```bash
# Error
401 Unauthorized: Invalid API key

# Solutions
# 1. Verify key format
echo $OPENAI_API_KEY
# Should start with 'sk-'

# 2. Test key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 3. Regenerate key
# Go to https://platform.openai.com/api-keys
# Create new key and update .env file
```

#### **Problem: API Rate Limits**
```javascript
// Error
RateLimitError: Rate limit exceeded

// Solution: Implement retry logic
// backend/src/services/llmService.js
const retry = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      const delay = Math.pow(2, 4 - retries) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1);
    }
    throw error;
  }
};
```

#### **Problem: API Quota Exceeded**
```bash
# Error
You exceeded your current quota

# Solutions
# 1. Check usage
curl https://api.openai.com/v1/dashboard/billing/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 2. Add billing information
# Visit https://platform.openai.com/account/billing

# 3. Use alternative provider temporarily
# Update .env to use Anthropic or other providers
```

### **Port Conflicts**

#### **Problem: Port Already in Use**
```bash
# Error
EADDRINUSE: address already in use :::3000

# Solutions
# 1. Find and kill process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# 2. Use different port
PORT=3001 npm start

# 3. Use kill-port package
npx kill-port 3000 5000
```

### **Build Issues**

#### **Problem: Frontend Build Fails**
```bash
# Error
Failed to compile with errors

# Solutions
# 1. Clear cache and rebuild
cd frontend
rm -rf node_modules build
npm cache clean --force
npm install
npm run build

# 2. Check for syntax errors
npm run lint

# 3. Update dependencies
npm audit fix
npm update

# 4. Increase memory limit
node --max-old-space-size=8192 node_modules/.bin/react-scripts build
```

#### **Problem: Backend Build Issues**
```bash
# Error
Cannot find module './config/database'

# Solutions
# 1. Check file paths are correct
ls -la src/config/

# 2. Verify imports match file names
grep -r "require.*database" src/

# 3. Check case sensitivity (Linux/macOS)
# Ensure file names match exactly

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **CORS Issues**

#### **Problem: CORS Policy Errors**
```javascript
// Error in browser console
Access to fetch at 'http://localhost:5000/api/experiments' from origin 'http://localhost:3000' has been blocked by CORS policy

// Solution: Update CORS configuration
// backend/src/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### **Problem: Preflight Request Failures**
```javascript
// Error
CORS policy: Response to preflight request doesn't pass access control check

// Solution: Handle OPTIONS requests
// backend/src/app.js
app.options('*', cors()); // Enable preflight for all routes

// Or handle manually
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});
```

### **Memory Issues**

#### **Problem: Out of Memory Errors**
```bash
# Error
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

# Solutions
# 1. Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=8192"

# 2. For npm scripts, update package.json
{
  "scripts": {
    "build": "node --max-old-space-size=8192 node_modules/.bin/react-scripts build"
  }
}

# 3. Check for memory leaks
npm install -g clinic
clinic doctor -- npm start
```

#### **Problem: Database Growing Too Large**
```bash
# Check database size
ls -lh backend/database.sqlite

# Clean up old data
cd backend
node -e "
const { sequelize } = require('./src/config/database');
sequelize.query('DELETE FROM responses WHERE created_at < datetime(\"now\", \"-30 days\")');
sequelize.query('VACUUM;');
"
```

## 🌐 Environment-Specific Issues

### **Windows Issues**

#### **Problem: Path Length Limitations**
```bash
# Error
ENAMETOOLONG: name too long

# Solutions
# 1. Enable long paths in Windows
# Run as administrator:
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1

# 2. Use shorter project path
# Move project closer to root: C:\projects\llm-lab

# 3. Use npm with long path support
npm config set cache C:\tmp\npm-cache
```

#### **Problem: Line Ending Issues**
```bash
# Error
Expected linebreaks to be 'LF' but found 'CRLF'

# Solution
# Configure Git to handle line endings
git config --global core.autocrlf true

# Fix existing files
npm run format
```

### **macOS Issues**

#### **Problem: Xcode Command Line Tools**
```bash
# Error
gyp: No Xcode or CLT version detected!

# Solution
xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

#### **Problem: Permission Issues with npm**
```bash
# Error
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'

# Solution
# Use nvm instead of system Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### **Linux Issues**

#### **Problem: Missing Build Tools**
```bash
# Error
make: not found

# Solution (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install build-essential python3-dev

# Solution (CentOS/RHEL)
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

## 🚀 Performance Troubleshooting

### **Slow API Responses**

#### **Problem: High Response Times**
```javascript
// Add performance monitoring
// backend/src/middleware/performance.js
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Use in app.js
app.use(performanceMonitor);
```

#### **Solutions:**
```javascript
// 1. Add database indexes
// migrations/add-performance-indexes.js
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('experiments', ['user_id', 'created_at']);
    await queryInterface.addIndex('responses', ['experiment_id', 'created_at']);
    await queryInterface.addIndex('quality_metrics', ['response_id']);
  }
};

// 2. Implement caching
const redis = require('redis');
const client = redis.createClient();

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// 3. Optimize database queries
// Use eager loading instead of N+1 queries
const experiments = await Experiment.findAll({
  include: [{
    model: Response,
    include: [QualityMetric]
  }]
});
```

### **Frontend Performance Issues**

#### **Problem: Slow Rendering**
```javascript
// Solution: Use React.memo and useMemo
import React, { memo, useMemo } from 'react';

const ExperimentCard = memo(({ experiment, onUpdate }) => {
  const computedMetrics = useMemo(() => {
    return calculateMetrics(experiment.responses);
  }, [experiment.responses]);

  return (
    <div className="experiment-card">
      {/* Component content */}
    </div>
  );
});

// Add displayName for debugging
ExperimentCard.displayName = 'ExperimentCard';
```

#### **Problem: Large Bundle Size**
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Solutions
# 1. Code splitting
const ExperimentDetail = lazy(() => import('./ExperimentDetail'));

# 2. Tree shaking - import only what you need
import { debounce } from 'lodash/debounce'; // Instead of import _ from 'lodash'

# 3. Optimize images
npm install imagemin-webpack-plugin --save-dev
```

## 🔍 Debugging Tools

### **Backend Debugging**

#### **Debug with VS Code**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

#### **Debug with Node.js Inspector**
```bash
# Start with debugging
node --inspect-brk src/server.js

# Or with nodemon
nodemon --inspect src/server.js

# Connect with Chrome DevTools
# Open chrome://inspect in Chrome
```

### **Frontend Debugging**

#### **React Developer Tools**
```bash
# Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

# Use in code
import { StrictMode } from 'react';

if (process.env.NODE_ENV === 'development') {
  const { StrictMode } = require('react');
  // Enable strict mode for better debugging
}
```

#### **Network Request Debugging**
```javascript
// Add request/response interceptors
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

## 📞 Getting Help

### **Self-Help Checklist**

Before asking for help, try these steps:

1. **Search existing issues** on GitHub
2. **Check the documentation** in the `docs/` folder
3. **Verify your environment** meets requirements
4. **Try the solutions** in this troubleshooting guide
5. **Check browser console** for error messages
6. **Review server logs** for backend issues

### **Creating Good Bug Reports**

When reporting bugs, include:

```markdown
## Environment
- OS: [Windows 10/macOS 12/Ubuntu 20.04]
- Node.js: [18.17.0]
- npm: [9.6.7]
- Browser: [Chrome 115/Firefox 116/Safari 16]

## Steps to Reproduce
1. Start the application
2. Navigate to experiments page
3. Click "Create Experiment"
4. Fill form and submit

## Expected Behavior
Form should submit successfully and show success message

## Actual Behavior
Gets error "Failed to create experiment"

## Error Messages
```
Backend console:
TypeError: Cannot read property 'name' of undefined
  at ExperimentController.create (/src/controllers/ExperimentController.js:15:25)

Browser console:
POST http://localhost:5000/api/experiments 500 (Internal Server Error)
```

## Screenshots
[Attach screenshots if relevant]

## Additional Context
This started happening after updating to version 1.2.0
```

### **Getting Community Help**

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general help
- **Discord**: For real-time community support
- **Stack Overflow**: Tag questions with `llm-lab`

### **Emergency Contacts**

For critical production issues:
- **Email**: emergency@llm-lab.com
- **Slack**: #critical-issues channel
- **On-call**: +1-555-0123 (24/7 for Enterprise customers)

---

**Remember: Most issues have simple solutions. Take a deep breath, read the error messages carefully, and try the solutions step by step. You've got this! 🚀**
