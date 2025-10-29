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
    <div className={`relative p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${gradient}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
          Get Started
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  </Link>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
    <div className="text-gray-600 font-medium">{label}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto pt-20 pb-16">
          <div className="text-center">
            {/* Header Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Next-Generation LLM Analysis Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight px-4">
              <span className="block">Optimize Your</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                LLM Responses
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed px-4">
              Advanced quality analysis and parameter optimization for Large Language Models. 
              Test, compare, and enhance your AI responses with scientific precision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <PresentationChartBarIcon className="w-5 h-5 mr-2" />
                Open Dashboard
              </Link>
              <Link 
                to="/experiment" 
                className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <BeakerIcon className="w-5 h-5 mr-2" />
                Start Experimenting
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto px-4">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for LLM Optimization
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to analyze, compare, and optimize your language model responses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Leveraging cutting-edge tools and frameworks for reliable, scalable LLM analysis
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { name: "React", color: "from-blue-500 to-cyan-500" },
              { name: "Node.js", color: "from-green-500 to-emerald-500" },
              { name: "OpenAI", color: "from-purple-500 to-pink-500" },
              { name: "Analytics", color: "from-orange-500 to-red-500" }
            ].map((tech, index) => (
              <div key={index} className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                  <CpuChipIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your LLM Performance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start analyzing and improving your language model responses today with our comprehensive quality analysis platform.
          </p>
          <Link 
            to="/experiment" 
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Start Your First Experiment
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;