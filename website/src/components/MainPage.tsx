import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import AppNavbar from './AppNavbar';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [insightsGenerated, setInsightsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="absolute inset-0 opacity-25 pointer-events-none">
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

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
            Your Cosmic Dashboard
          </h1>
          <p className="text-xl text-white/75 max-w-3xl mx-auto mb-8">
            Track your growth, refine your profile, and generate astrology & numerology insights.
          </p>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-custom-yellow rounded-full animate-pulse"></div>
              <span className="text-gray-300">Loading your cosmic profile...</span>
            </div>
          )}
          
          {/* Conditional Buttons */}
          {!isLoading && (
            <div className="space-y-4">
              {(!insightsGenerated || apiError) && (
                <button 
                  onClick={handleGettingStarted}
                  className="bg-custom-yellow hover:bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Getting Started
                </button>
              )}
              
            </div>
          )}
        </div>

        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-custom-yellow/15 rounded-lg flex items-center justify-center">
                <span className="text-custom-yellow text-xl">☉</span>
              </div>
              <span className="text-sm text-custom-yellow font-medium">New</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Profile</h3>
            <p className="text-white/70 text-sm">Birth details & chart preferences</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-violet-400/15 rounded-lg flex items-center justify-center">
                <span className="text-violet-300 text-xl">✶</span>
              </div>
              <span className="text-sm text-violet-200 font-medium">Insights</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Numerology</h3>
            <p className="text-white/70 text-sm">Life path & personal year</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">☾</span>
              </div>
              <span className="text-sm text-white/70 font-medium">Track</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Growth</h3>
            <p className="text-white/70 text-sm">Emotional score & themes</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-custom-yellow/15 rounded-lg flex items-center justify-center">
                <span className="text-custom-yellow text-xl">∞</span>
              </div>
              <span className="text-sm text-custom-yellow font-medium">Reports</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Compatibility</h3>
            <p className="text-white/70 text-sm">Partner profile analysis</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-display">Recent Readings</h2>
              <div className="space-y-4">
                {[
                  { name: 'Birth Chart Overview', status: 'In Progress', progress: 75, team: 'Astrology' },
                  { name: 'Life Path & Destiny', status: 'Planning', progress: 25, team: 'Numerology' },
                  { name: 'Compatibility Snapshot', status: 'Completed', progress: 100, team: 'Reports' },
                  { name: 'Monthly Growth Check-in', status: 'In Progress', progress: 60, team: 'Growth' },
                ].map((project, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-4 hover:border-custom-yellow/60 transition-colors bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{project.name}</h3>
                        <p className="text-sm text-white/70">{project.team}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'In Progress'
                          ? 'bg-custom-yellow/15 text-custom-yellow'
                          : 'bg-white/10 text-white/80'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-custom-yellow h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
