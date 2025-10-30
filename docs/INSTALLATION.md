# Installation Guide

## 📋 Prerequisites

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: 1GB free space
- **Network**: Internet connection for LLM API access

### **Development Tools**
- **Git**: For version control
- **Code Editor**: VS Code (recommended), WebStorm, or similar
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 🚀 Installation Steps

### **1. Clone the Repository**

```bash
# Using HTTPS
git clone https://github.com/parthkm78/LLM-LAB.git

# Using SSH (if configured)
git clone git@github.com:parthkm78/LLM-LAB.git

# Navigate to project directory
cd LLM-LAB
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables (see Configuration section)
# Use your preferred editor: nano, vim, code, etc.
code .env
```

### **3. Frontend Setup**

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables
code .env
```

### **4. Database Setup**

```bash
# Navigate back to backend directory
cd ../backend

# Initialize database
npm run db:setup

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### **5. Environment Configuration**

#### **Backend Environment Variables (.env)**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=sqlite:./database.sqlite
DATABASE_LOG_LEVEL=error

# LLM API Keys (Required for functionality)
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=5

# Cache Configuration
CACHE_TTL=3600  # 1 hour
CACHE_MAX_SIZE=100

# LLM Service Configuration
LLM_DEFAULT_MODEL=gpt-4
LLM_TIMEOUT=30000  # 30 seconds
LLM_MAX_RETRIES=3
```

#### **Frontend Environment Variables (.env)**

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Application Configuration
REACT_APP_APP_NAME=LLM Lab
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_BATCH_EXPERIMENTS=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_ADVANCED_METRICS=true

# UI Configuration
REACT_APP_THEME=default
REACT_APP_DEFAULT_MODEL=gpt-4
REACT_APP_MAX_RESPONSES_DISPLAY=50
REACT_APP_AUTO_SAVE_INTERVAL=30000  # 30 seconds

# Development Configuration
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug

# Analytics (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
REACT_APP_HOTJAR_ID=your-hotjar-id
```

### **6. API Key Setup**

#### **OpenAI API Key**
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key and add to backend `.env` file

#### **Anthropic API Key (Optional)**
1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key and add to backend `.env` file

### **7. Start the Application**

#### **Method 1: Manual Start (Recommended for Development)**

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend (in new terminal)
cd frontend
npm start
```

#### **Method 2: Concurrent Start**

```bash
# From project root
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm start"
```

### **8. Verify Installation**

1. **Frontend Access**: Open http://localhost:3000
2. **Backend API**: Open http://localhost:5000/api/health
3. **API Documentation**: Open http://localhost:5000/api-docs (if enabled)

#### **Health Check**
```bash
# Test backend API
curl http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-10-30T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## 🔧 Advanced Configuration

### **Database Configuration**

#### **SQLite (Default)**
```bash
# Already configured in .env
DATABASE_URL=sqlite:./database.sqlite
```

#### **PostgreSQL (Production)**
```bash
# Install PostgreSQL driver
cd backend
npm install pg

# Update .env
DATABASE_URL=postgresql://username:password@localhost:5432/llm_lab
```

#### **MySQL (Alternative)**
```bash
# Install MySQL driver
cd backend
npm install mysql2

# Update .env
DATABASE_URL=mysql://username:password@localhost:3306/llm_lab
```

### **Docker Setup (Optional)**

#### **Docker Compose**
```yaml
# docker-compose.yml (create in project root)
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=sqlite:./database.sqlite
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
```

```bash
# Run with Docker
docker-compose up -d
```

### **SSL/HTTPS Setup (Production)**

#### **Backend HTTPS**
```bash
# Generate self-signed certificate (development)
cd backend
mkdir ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# Update .env
HTTPS_ENABLED=true
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

#### **Frontend HTTPS**
```bash
# Update frontend .env
HTTPS=true
SSL_CRT_FILE=ssl/cert.pem
SSL_KEY_FILE=ssl/key.pem
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3000  # or :5000

# Kill process
kill -9 <PID>

# Or change ports in .env files
```

#### **Node Version Issues**
```bash
# Check Node version
node --version

# Update Node.js using nvm
nvm install 18
nvm use 18
```

#### **Permission Errors (macOS/Linux)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### **Database Connection Issues**
```bash
# Reset database
cd backend
rm database.sqlite
npm run db:setup
npm run db:migrate
```

#### **API Key Issues**
1. Verify API keys are correctly set in `.env`
2. Check API key validity on provider websites
3. Ensure sufficient API credits/quota
4. Check network connectivity

#### **Frontend Build Issues**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### **Log Files**

#### **Backend Logs**
```bash
# View current logs
cd backend
tail -f logs/app.log

# View error logs
grep "ERROR" logs/app.log
```

#### **Frontend Logs**
- Browser Console (F12 → Console)
- Network tab for API call issues
- React DevTools for component issues

### **Performance Issues**

#### **Slow API Responses**
1. Check internet connection
2. Verify LLM provider status
3. Monitor backend logs for errors
4. Consider reducing request complexity

#### **High Memory Usage**
1. Restart application
2. Check for memory leaks in logs
3. Reduce concurrent operations
4. Clear browser cache

## 📞 Support

### **Getting Help**
1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/parthkm78/LLM-LAB/issues)
3. Create new issue with detailed information
4. Join community discussions

### **When Reporting Issues**
Include the following information:
- Operating system and version
- Node.js and npm versions
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

### **Useful Commands**

#### **System Information**
```bash
# Check versions
node --version
npm --version
git --version

# Check disk space
df -h

# Check memory usage
free -h  # Linux
top      # macOS/Linux
```

#### **Project Information**
```bash
# Check dependencies
npm list

# Check for outdated packages
npm outdated

# Security audit
npm audit

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

**Installation complete! 🎉 Ready to explore LLM-LAB!**
