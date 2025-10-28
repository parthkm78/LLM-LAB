import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Styles
import './styles/mobile-optimizations.css';

// Layout Components
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Experiment from './pages/Experiment';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import About from './pages/About';
import Settings from './pages/Settings';
import SettingsTest from './pages/SettingsTest';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App font-sans antialiased">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="experiment" element={<Experiment />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="comparison" element={<Comparison />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
          
          {/* Enhanced Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
                style: {
                  borderColor: '#10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
                style: {
                  borderColor: '#ef4444',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: 'white',
                },
                style: {
                  borderColor: '#3b82f6',
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
