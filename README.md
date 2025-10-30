# LLM-LAB Project README

## 🚀 Overview

LLM-LAB is a comprehensive analysis platform for Large Language Model (LLM) experimentation, parameter optimization, and quality assessment. The system provides real-time testing capabilities, advanced analytics, and detailed insights for AI response optimization.

## ✨ Key Features

- **Parameter Testing Lab**: Interactive parameter tuning with real-time response generation
- **Batch Experiments**: Multi-parameter testing with comprehensive analysis
- **Quality Metrics System**: 6-dimensional quality assessment with advanced analytics
- **Response Comparison**: Side-by-side analysis with detailed insights
- **Advanced Analytics**: Correlation studies, optimization insights, and trend analysis
- **Export & Reports**: Multi-format data export and comprehensive reporting

## 🏗️ System Architecture

### **Frontend**
- **Framework**: React.js with modern hooks and context
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Recharts for interactive visualizations
- **State Management**: React Context with custom hooks

### **Backend**
- **Runtime**: Node.js with Express.js
- **Database**: SQLite with comprehensive schema
- **APIs**: RESTful with real-time Server-Sent Events
- **Authentication**: JWT-based security

### **Core Services**
- **LLM Integration**: Multi-provider support (OpenAI, Anthropic, etc.)
- **Quality Analysis Engine**: Advanced NLP metrics calculation
- **Parameter Optimization**: Genetic algorithms and Bayesian optimization
- **Real-time Processing**: Streaming updates and progress tracking

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Git for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/parthkm78/LLM-LAB.git
cd LLM-LAB
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**
```bash
# Backend (.env)
cd ../backend
cp .env.example .env
# Edit .env with your API keys and configuration

# Frontend (.env)
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

5. **Database Setup**
```bash
cd ../backend
npm run db:setup
npm run db:migrate
npm run db:seed
```

6. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

7. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 📚 Documentation

### **Technical Documentation**
- [System Architecture](./docs/Architecture/SYSTEM_ARCHITECTURE_DOCUMENT.md)
- [Backend API Specification](./docs/backend-apis%20document/BACKEND_API_SPECIFICATION.md)
- [Features Documentation](./docs/Features/LLM_LAB_FEATURES_DOCUMENTATION.md)

### **Component Specifications**
- [Quality Metrics System](./docs/Techncial%20document/Quality%20Metrix/QUALITY_METRICS_TECHNICAL_SPECIFICATION.md)
- [Parameter Testing Lab](./docs/Techncial%20document/Perameter%20TestingLab/PARAMETER_TESTING_TECHNICAL_SPECIFICATION.md)
- [Batch Experiment Analysis](./docs/Techncial%20document/Batch%20Experiment/BATCH_EXPERIMENT_ANALYSIS.md)

### **Development Documentation**
- [Installation Guide](./docs/INSTALLATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)
- [API Documentation](./docs/API.md)

## 🛠️ Development

### **Available Scripts**

#### **Backend**
```bash
npm run dev          # Start development server with hot reload
npm run start        # Start production server
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

#### **Frontend**
```bash
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run eject        # Eject from Create React App (irreversible)
```

### **Project Structure**
```
LLM-LAB/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── styles/         # CSS and design tokens
│   ├── public/             # Static assets
│   └── package.json
└── docs/                   # Documentation
```

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Run unit tests
npm run test:integration   # Run integration tests
npm run test:coverage     # Run tests with coverage
```

### **Frontend Testing**
```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage     # Run tests with coverage
```

### **End-to-End Testing**
```bash
npm run test:e2e          # Run E2E tests with Cypress
```

## 🚀 Deployment

### **Production Build**
```bash
# Build frontend
cd frontend
npm run build

# Prepare backend
cd ../backend
npm run build
```

### **Environment Variables**

#### **Backend (.env)**
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=sqlite:./database.sqlite
DATABASE_MAX_CONNECTIONS=10

# LLM API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### **Frontend (.env)**
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_EXPORT=true

# UI Configuration
REACT_APP_THEME=default
REACT_APP_DEFAULT_MODEL=gpt-4
```

### **Deployment Options**
- [Docker Deployment](./docs/DEPLOYMENT.md#docker)
- [AWS Deployment](./docs/DEPLOYMENT.md#aws)
- [Vercel + Railway](./docs/DEPLOYMENT.md#vercel-railway)
- [Self-hosted](./docs/DEPLOYMENT.md#self-hosted)

## 🔧 Configuration

### **Supported LLM Providers**
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic (Claude 3.5)
- Google (Gemini Pro) - Coming Soon
- Local Models - Coming Soon

### **Quality Metrics**
- **Coherence**: Logical flow and consistency
- **Completeness**: Response thoroughness
- **Readability**: Clarity and comprehension
- **Creativity**: Originality and innovation
- **Specificity**: Detail level and precision
- **Length Appropriateness**: Optimal response length

## 📊 Performance

### **Benchmarks**
- Average API response time: ~2.8s
- Quality analysis processing: ~1.2s
- Concurrent experiment support: 50+
- Database query performance: <100ms
- Frontend bundle size: <2MB gzipped

### **Scalability**
- Horizontal scaling support
- Database connection pooling
- Response caching
- Rate limiting protection
- Memory-efficient processing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### **Code Standards**
- ESLint configuration enforced
- Prettier for code formatting
- Jest for testing
- Conventional commits
- TypeScript definitions

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [Installation Guide](./docs/INSTALLATION.md)
- [API Documentation](./docs/API.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

### **Community**
- GitHub Issues: Report bugs and request features
- Discussions: Community Q&A and ideas
- Wiki: Additional documentation and examples

### **Contact**
- Project Maintainer: [@parthkm78](https://github.com/parthkm78)
- Email: support@llm-lab.com
- Website: https://llm-lab.com

## 🗺️ Roadmap

### **Phase 1 - Core Features** ✅
- Parameter Testing Lab
- Quality Metrics System
- Basic Analytics
- Response Comparison

### **Phase 2 - Advanced Features** 🚧
- Batch Experiments
- Advanced Analytics
- Export & Reports
- Auto-Optimizer

### **Phase 3 - Enterprise Features** 📅
- Multi-user Support
- Team Collaboration
- Advanced Security
- Custom Models

### **Phase 4 - ML Enhancement** 📅
- Predictive Quality Models
- Auto-parameter Optimization
- Custom Metric Training
- A/B Testing Framework

## 🏆 Acknowledgments

- OpenAI for GPT model access
- Anthropic for Claude model access
- React.js and Node.js communities
- Open source contributors

---

**Built with ❤️ for the AI research community**
