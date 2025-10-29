import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  BeakerIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  ArrowRightIcon,
  CpuChipIcon,
  LightBulbIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, link, gradient }) => (
  <Link to={link} className="group block">
    <div className="relative p-5 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-102">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {title}
        </h3>
        <p className="text-xs text-gray-600 mb-3 leading-tight line-clamp-3">
          {description}
        </p>
        <div className="flex items-center text-blue-600 font-medium text-xs group-hover:text-blue-700">
          Get Started
          <ArrowRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  </Link>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">{value}</div>
    <div className="text-xs text-gray-600 font-medium">{label}</div>
  </div>
);

const Home = () => {
  const features = [
    {
      icon: PresentationChartBarIcon,
      title: "Interactive Dashboard",
      description: "Comprehensive visual analytics with real-time metrics, parameter experimentation, and intelligent insights.",
      link: "/dashboard",
      gradient: "hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50"
    },
    {
      icon: BeakerIcon,
      title: "Parameter Testing",
      description: "Test different LLM parameters like temperature and top_p to optimize response quality and creativity.",
      link: "/experiment",
      gradient: "hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
    },
    {
      icon: ChartBarIcon,
      title: "Quality Analysis",
      description: "Comprehensive metrics analysis including coherence, completeness, readability, and relevance scoring.",
      link: "/analysis",
      gradient: "hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50"
    },
    {
      icon: DocumentTextIcon,
      title: "Response Comparison",
      description: "Side-by-side comparison of multiple LLM responses with detailed quality breakdowns and insights.",
      link: "/comparison",
      gradient: "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50"
    }
  ];

  const stats = [
    { value: "1000+", label: "Responses Analyzed", icon: DocumentTextIcon },
    { value: "95%", label: "Accuracy Rate", icon: ChartBarIcon },
    { value: "50ms", label: "Avg Analysis Time", icon: CpuChipIcon },
    { value: "4.9/5", label: "User Rating", icon: SparklesIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto pt-16 pb-12">
          <div className="text-center">
            {/* Header Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-blue-800 text-xs font-medium mb-6">
              <SparklesIcon className="w-3 h-3 mr-1.5" />
              Next-Generation LLM Analysis Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight px-4">
              <span className="block">Optimize Your</span>
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                LLM Responses
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mb-8 leading-relaxed px-4">
              Advanced quality analysis and parameter optimization for Large Language Models. 
              Test, compare, and enhance your AI responses with scientific precision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                <PresentationChartBarIcon className="w-4 h-4 mr-2" />
                Open Dashboard
              </Link>
              <Link 
                to="/experiment" 
                className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-900 font-bold rounded-xl border border-white/20 hover:bg-white hover:shadow-lg transition-all duration-300 text-sm"
              >
                <BeakerIcon className="w-4 h-4 mr-2" />
                Start Experimenting
              </Link>
            </div>

            {/* Hero Feature Cards */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Quick Access Cards */}
                <Link to="/experiment" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BeakerIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-sm">Parameter Testing</h3>
                        <p className="text-xs text-gray-600">Optimize AI parameters</p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>

                <Link to="/analysis" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-sm">Quality Analysis</h3>
                        <p className="text-xs text-gray-600">Comprehensive metrics</p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>

                <Link to="/comparison" className="group">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-sm">Response Compare</h3>
                        <p className="text-xs text-gray-600">Side-by-side analysis</p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Powerful Features for LLM Optimization
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze, compare, and optimize your language model responses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Built with Modern Technology
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
              Leveraging cutting-edge tools and frameworks for reliable, scalable LLM analysis
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { name: "React", color: "from-blue-500 to-cyan-500" },
              { name: "Node.js", color: "from-green-500 to-emerald-500" },
              { name: "OpenAI", color: "from-purple-500 to-pink-500" },
              { name: "Analytics", color: "from-orange-500 to-red-500" }
            ].map((tech, index) => (
              <div key={index} className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${tech.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <CpuChipIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="font-bold text-gray-900 text-xs sm:text-sm">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Optimize Your LLM Performance?
          </h2>
          <p className="text-base text-white/80 mb-6 max-w-xl mx-auto">
            Start analyzing and improving your language model responses today with our comprehensive quality analysis platform.
          </p>
          <Link 
            to="/experiment" 
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
          >
            <LightBulbIcon className="w-4 h-4 mr-2" />
            Start Your First Experiment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;