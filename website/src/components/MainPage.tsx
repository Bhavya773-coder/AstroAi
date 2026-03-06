import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import AppNavbar from './AppNavbar';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const checkInsightStatus = async () => {
      try {
        console.log('Checking insight status...');
        console.log('Making API call to:', `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/profile/insight-status`);
        
        const response = await apiFetch('/api/profile/insight-status');
        console.log('Raw API response:', response);
        
        if (!response) {
          console.log('No response received, defaulting to false');
          setInsightsGenerated(false);
          setApiError(true);
          return;
        }
        
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        
        // Handle new API response format
        if (response.success && response.profile) {
          console.log('Setting insightsGenerated to:', response.profile.insights_generated);
          setInsightsGenerated(response.profile.insights_generated || false);
          setUserData(response.profile);
          setApiError(false);
        } else {
          console.log('Invalid response format, defaulting to false');
          setInsightsGenerated(false);
          setApiError(true);
        }
      } catch (error: any) {
        console.error('Error checking insight status:', error);
        console.error('Error details:', error?.message || error?.toString());
        // Default to false if API fails
        setInsightsGenerated(false);
        setApiError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkInsightStatus();
  }, []);

  const handleGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const getMoonPhase = () => {
    // Simple moon phase calculation
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let julianDate = (year - 2000) * 365.25 + (month - 1) * 30.44 + day;
    let phase = (julianDate % 29.53) / 29.53;
    
    if (phase < 0.25) return "🌑 New Moon";
    if (phase < 0.5) return "🌓 First Quarter";
    if (phase < 0.75) return "🌕 Full Moon";
    return "🌗 Last Quarter";
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dash_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
              <stop stopColor="#FDE047" stopOpacity="0.35" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dash_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(860 220) rotate(90) scale(260 380)">
              <stop stopColor="#A78BFA" stopOpacity="0.32" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#dash_g1)" />
          <rect width="1200" height="800" fill="url(#dash_g2)" />
          {Array.from({ length: 90 }).map((_, i) => {
            const x = (i * 79) % 1200;
            const y = (i * 47) % 800;
            const r = (i % 7) === 0 ? 2 : 1;
            return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" fillOpacity="0.55" />;
          })}
        </svg>
      </div>

      {/* Navigation Header */}
      <AppNavbar />

      {/* Main Dashboard Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-2">
                Welcome to Your Cosmic Journey
              </h1>
              <p className="text-lg text-white/75">
                {getCurrentDate()} • {getMoonPhase()}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/birth-chart')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🌟 Birth Chart
              </button>
              <button 
                onClick={() => navigate('/numerology')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔢 Numerology
              </button>
              <button 
                onClick={() => navigate('/reports')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📊 Reports
              </button>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        {!isLoading && (!insightsGenerated || apiError) && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-6xl mb-4">🌙</div>
                <h2 className="text-2xl font-bold text-white mb-4">Begin Your Astrological Journey</h2>
                <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                  Create your cosmic profile to unlock personalized birth chart insights, 
                  numerology readings, and compatibility analysis.
                </p>
                <button 
                  onClick={handleGettingStarted}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✨ Getting Started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-4 h-4 bg-custom-yellow rounded-full animate-pulse"></div>
            <span className="text-gray-300">Loading your cosmic profile...</span>
          </div>
        )}

        {/* Main Dashboard Grid */}
        {insightsGenerated && !apiError && (
          <>
            {/* Featured Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Cosmic Insight */}
              <div className="lg:col-span-2 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Daily Cosmic Insight</h3>
                  <span className="text-purple-300 text-sm">Today</span>
                </div>
                <div className="bg-black/30 rounded-xl p-6 mb-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3">☉</div>
                    <h4 className="text-lg font-semibold text-yellow-300 mb-2">Solar Energy High</h4>
                    <p className="text-white/80 text-sm">
                      Today's cosmic alignment favors leadership and creative expression. 
                      Your natural charisma is amplified, making it perfect for important conversations.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-sm text-white/70">Energy</div>
                    <div className="text-lg font-bold text-orange-400">High</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">💫</div>
                    <div className="text-sm text-white/70">Focus</div>
                    <div className="text-lg font-bold text-blue-400">Sharp</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">❤️</div>
                    <div className="text-sm text-white/70">Harmony</div>
                    <div className="text-lg font-bold text-pink-400">Balanced</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4">Your Cosmic Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Life Path Number</span>
                    <span className="text-blue-300 font-bold">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Ruling Planet</span>
                    <span className="text-purple-300 font-bold">Jupiter</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Element</span>
                    <span className="text-orange-300 font-bold">Fire</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Power Day</span>
                    <span className="text-green-300 font-bold">Thursday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Lucky Color</span>
                    <span className="text-yellow-300 font-bold">Gold</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button 
                onClick={() => navigate('/birth-chart')}
                className="group bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-2xl p-6 backdrop-blur-sm hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-400/20 rounded-xl flex items-center justify-center group-hover:bg-orange-400/30 transition-colors">
                    <span className="text-orange-300 text-2xl">☉</span>
                  </div>
                  <span className="text-orange-300 text-sm font-medium">Featured</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Birth Chart</h3>
                <p className="text-white/70 text-sm">Complete astrological analysis</p>
              </button>

              <button 
                onClick={() => navigate('/numerology')}
                className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
                    <span className="text-blue-300 text-2xl">🔢</span>
                  </div>
                  <span className="text-blue-300 text-sm font-medium">Popular</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Numerology</h3>
                <p className="text-white/70 text-sm">Life path & destiny numbers</p>
              </button>

              <button 
                onClick={() => navigate('/reports')}
                className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 backdrop-blur-sm hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center group-hover:bg-green-400/30 transition-colors">
                    <span className="text-green-300 text-2xl">📊</span>
                  </div>
                  <span className="text-green-300 text-sm font-medium">New</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Reports</h3>
                <p className="text-white/70 text-sm">Compatibility analysis</p>
              </button>

              <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-sm hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 text-left opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center group-hover:bg-purple-400/30 transition-colors">
                    <span className="text-purple-300 text-2xl">🔮</span>
                  </div>
                  <span className="text-purple-300 text-sm font-medium">Coming</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tarot</h3>
                <p className="text-white/70 text-sm">Daily card readings</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-slate-800/50 to-indigo-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Recent Cosmic Activity</h3>
              <div className="space-y-4">
                {[
                  { 
                    icon: '☉', 
                    title: 'Birth Chart Analysis', 
                    description: 'Complete astrological profile generated',
                    time: '2 hours ago',
                    color: 'orange'
                  },
                  { 
                    icon: '🔢', 
                    title: 'Life Path Reading', 
                    description: 'Numerology insights revealed',
                    time: '1 day ago',
                    color: 'blue'
                  },
                  { 
                    icon: '💑', 
                    title: 'Compatibility Check', 
                    description: 'Partner analysis completed',
                    time: '3 days ago',
                    color: 'pink'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                    <div className={`w-10 h-10 bg-${activity.color}-400/20 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-${activity.color}-300 text-lg`}>{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{activity.title}</h4>
                      <p className="text-white/70 text-sm">{activity.description}</p>
                      <p className="text-white/50 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainPage;
