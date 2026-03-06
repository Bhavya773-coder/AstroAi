import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';

interface LifeContextData {
  career_stage: string;
  relationship_status: string;
  main_life_focus: string;
  personality_style: string;
  primary_life_problem: string;
}

const OnboardingStep2: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LifeContextData>({
    career_stage: '',
    relationship_status: '',
    main_life_focus: '',
    personality_style: '',
    primary_life_problem: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load basic profile data from localStorage
    const basicData = localStorage.getItem('onboarding_basic');
    if (!basicData) {
      navigate('/onboarding/step-1');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch('/api/profile/context', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Store data for next step
      localStorage.setItem('onboarding_context', JSON.stringify(formData));
      navigate('/onboarding/step-3');
    } catch (err: any) {
      setError(err.message || 'Failed to save life context');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate('/onboarding/step-1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <div className="w-16 h-1 bg-yellow-400 rounded"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-indigo-900 text-sm font-medium">2</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">3</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-2">Step 2 of 3: Life Context</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4">
              <span className="text-yellow-400 text-2xl">🌟</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Life Context</h1>
            <p className="text-gray-300">Help us understand your current life situation</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Career Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Career Stage *
              </label>
              <select
                name="career_stage"
                value={formData.career_stage}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="" className="bg-indigo-900">Select your career stage</option>
                <option value="student" className="bg-indigo-900">Student</option>
                <option value="early-career" className="bg-indigo-900">Early Career</option>
                <option value="mid-career" className="bg-indigo-900">Mid Career</option>
                <option value="entrepreneur" className="bg-indigo-900">Entrepreneur</option>
              </select>
            </div>

            {/* Relationship Status */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Relationship Status *
              </label>
              <select
                name="relationship_status"
                value={formData.relationship_status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="" className="bg-indigo-900">Select relationship status</option>
                <option value="single" className="bg-indigo-900">Single</option>
                <option value="relationship" className="bg-indigo-900">In a Relationship</option>
                <option value="married" className="bg-indigo-900">Married</option>
              </select>
            </div>

            {/* Main Life Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Main Life Focus *
              </label>
              <select
                name="main_life_focus"
                value={formData.main_life_focus}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="" className="bg-indigo-900">Select your main focus</option>
                <option value="career" className="bg-indigo-900">Career</option>
                <option value="relationships" className="bg-indigo-900">Relationships</option>
                <option value="finance" className="bg-indigo-900">Finance</option>
                <option value="health" className="bg-indigo-900">Health</option>
                <option value="spirituality" className="bg-indigo-900">Spirituality</option>
              </select>
            </div>

            {/* Personality Style */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Personality Style *
              </label>
              <select
                name="personality_style"
                value={formData.personality_style}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              >
                <option value="" className="bg-indigo-900">Select your personality style</option>
                <option value="analytical" className="bg-indigo-900">Analytical</option>
                <option value="emotional" className="bg-indigo-900">Emotional</option>
                <option value="practical" className="bg-indigo-900">Practical</option>
                <option value="spiritual" className="bg-indigo-900">Spiritual</option>
              </select>
            </div>

            {/* Primary Life Problem */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Primary Life Challenge *
              </label>
              <textarea
                name="primary_life_problem"
                value={formData.primary_life_problem}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                placeholder="Describe your main life challenge or goal..."
                required
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Generate Insights'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
