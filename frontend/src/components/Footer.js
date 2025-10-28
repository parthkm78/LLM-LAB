import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CpuChipIcon,
  HeartIcon,
  CodeBracketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#' },
      { name: 'API Docs', href: '#' },
      { name: 'Tutorials', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Support', href: '#' },
    ],
    resources: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'GitHub', href: '#' },
      { name: 'Status', href: '#' },
    ],
    legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Cookies', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 group mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
                  <CpuChipIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  LLM Analyzer
                </h3>
                <p className="text-xs text-gray-400 -mt-1">Quality Intelligence</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Advanced AI-powered platform for comprehensive LLM response quality analysis. 
              Evaluate, compare, and optimize your language models with professional-grade metrics.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm">Powered by AI</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <CodeBracketIcon className="w-4 h-4" />
                <span className="text-sm">Open Source</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© {currentYear} LLM Analyzer. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Made with</span>
                <HeartIcon className="w-4 h-4 text-red-400" />
                <span>for AI developers</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </span>
              <span>v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
