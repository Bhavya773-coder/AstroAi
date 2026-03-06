import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';

interface BasicProfileData {
  full_name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  gender: string;
  current_location: string;
}

const OnboardingStep1: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BasicProfileData>({
    full_name: '',
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: '',
    gender: '',
    current_location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting form data:', formData);
      const response = await apiFetch('/api/profile/basic', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      console.log('API response:', response);
      
      // Store data for next step
      localStorage.setItem('onboarding_basic', JSON.stringify(formData));
      navigate('/onboarding/step-2');
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to save profile information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-indigo-900 text-sm font-medium">1</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">2</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-sm font-medium">3</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-300 mt-2">Step 1 of 3: Basic Profile</p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4">
              <span className="text-yellow-400 text-2xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Tell Us About Yourself</h1>
            <p className="text-gray-300">Let's start with your basic information</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Time of Birth
              </label>
              <input
                type="time"
                name="time_of_birth"
                value={formData.time_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Place of Birth *
              </label>
              <input
                type="text"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="City, Country"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="" className="bg-indigo-900">Select gender</option>
                <option value="male" className="bg-indigo-900">Male</option>
                <option value="female" className="bg-indigo-900">Female</option>
                <option value="other" className="bg-indigo-900">Other</option>
                <option value="prefer_not_to_say" className="bg-indigo-900">Prefer not to say</option>
              </select>
            </div>

            {/* Current Location */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Current Location
              </label>
              <input
                type="text"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Next Step'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1;
