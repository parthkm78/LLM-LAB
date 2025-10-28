# LLM Response Quality Analyzer

A full-stack web application that helps users understand how LLM parameters (temperature, top_p) affect response quality by generating multiple responses and analyzing them with custom quality metrics.

## Project Structure

```
llm-response-analyzer/
├── frontend/           # React.js frontend application
├── backend/           # Node.js Express API server
├── README.md          # This file
└── docs/              # Additional documentation
```

## Tech Stack

### Frontend
- **React.js** (JavaScript) - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Chart.js/Recharts** - Data visualization
- **Tailwind CSS** - Styling framework
- **React Hook Form** - Form management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (development)
- **OpenAI API** - LLM integration
- **Cors** - Cross-origin resource sharing
- **Helmet** - Security middleware

## Features

### Core Functionality
- ✅ Parameter input interface (prompt, temperature, top_p ranges)
- ✅ Multiple LLM response generation with different parameters
- ✅ Custom quality metrics calculation
- ✅ Response comparison and analysis
- ✅ Experiment data persistence
- ✅ Export functionality (JSON, CSV)

### Quality Metrics
- **Coherence Score** - Measures logical flow and consistency
- **Completeness Score** - Evaluates response thoroughness
- **Readability Score** - Assesses clarity and structure
- **Length Appropriateness** - Checks if response length matches prompt complexity

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd llm-response-analyzer
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# In backend/.env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
DATABASE_URL=./database.sqlite
```

5. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## API Endpoints

- `POST /api/experiments` - Create new experiment
- `GET /api/experiments` - List all experiments
- `GET /api/experiments/:id` - Get specific experiment
- `POST /api/responses/generate` - Generate LLM responses
- `GET /api/responses/:id/metrics` - Get quality metrics
- `GET /api/export/:experimentId` - Export experiment data

## Development

### Project Architecture
- **Frontend**: React SPA with component-based architecture
- **Backend**: RESTful API with Express.js
- **Database**: SQLite for development, PostgreSQL for production
- **State Management**: React Context + useReducer
- **Styling**: Tailwind CSS with custom components

### Code Organization
```
frontend/src/
├── components/        # Reusable UI components
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── services/         # API service functions
├── utils/            # Helper functions
└── styles/           # CSS and styling

backend/src/
├── routes/           # API route handlers
├── models/           # Database models
├── services/         # Business logic
├── middleware/       # Express middleware
├── utils/            # Helper functions
└── config/           # Configuration files
```

## Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

### Hosting Options
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Railway, Render, or Heroku
- **Database**: PostgreSQL on hosting platform

## Contributing

1. Follow the established code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the GenAI-Labs Challenge.
