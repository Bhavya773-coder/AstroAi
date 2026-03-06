import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import toast from 'react-hot-toast';

const OnboardingStep3: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Analyzing birth details...');

  useEffect(() => {
    const progressSteps = [
      'Analyzing birth details...',
      'Calculating planetary positions...',
      'Generating birth chart insights...',
      'Computing numerology patterns...',
      'Creating personalized recommendations...',
      'Finalizing your cosmic profile...'
    ];

    const generateInsights = async () => {
      try {
        // Simulate progress updates
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
          stepIndex++;
          if (stepIndex < progressSteps.length) {
            setCurrentStep(progressSteps[stepIndex]);
          }
          
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 800);

        const response = await apiFetch('/api/profile/generate-insights', {
          method: 'POST',
          body: JSON.stringify({})
        });

        console.log('Insights generation response:', response);

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep('Complete!');

        // Clear onboarding data
        localStorage.removeItem('onboarding_basic');
        localStorage.removeItem('onboarding_context');

        // Show success toast
        toast.success(`${getProfessionalSymbol('✨')} Your insights are ready! Explore them in the Numerology tab.`);

        // Redirect to numerology page after a short delay
        setTimeout(() => {
          navigate('/numerology');
        }, 1500);

      } catch (err: any) {
        console.error('Error generating insights:', err);
        setError(err.message || 'Failed to generate insights');
        toast.error('Failed to generate insights. Please try again.');
      }
    };

    generateInsights();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <span className="text-red-400 text-2xl">{getProfessionalSymbol('⚠️')}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Generation Failed</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <div className="w-16 h-1 bg-green-500 rounded"></div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <div className="w-16 h-1 bg-yellow-400 rounded"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-indigo-900 text-sm font-medium">3</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-2">Step 3 of 3: Generating Insights</p>
        </div>

        {/* Loading Animation */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400/20 rounded-full mb-6 relative">
              <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"
                style={{ transform: `rotate(${progress * 3.6}deg)` }}
              ></div>
              <span className="text-yellow-400 text-3xl">{getProfessionalSymbol('🔮')}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {progress < 100 ? 'Generating Your Insights' : 'Complete!'}
            </h1>
            
            <p className="text-gray-300 mb-8">
              {progress < 100 
                ? currentStep
                : 'Your cosmic profile has been successfully created.'
              }
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 mb-8">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2 text-sm text-gray-300">
              {progress >= 20 && <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Analyzing birth chart patterns</span>
              </div>}
              {progress >= 40 && <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Calculating numerology profiles</span>
              </div>}
              {progress >= 60 && <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Processing life context data</span>
              </div>}
              {progress >= 80 && <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Generating personalized insights</span>
              </div>}
              {progress >= 100 && <div className="flex items-center justify-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-green-400 font-semibold">Complete! Redirecting to dashboard...</span>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
