import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      console.log('Google callback URL:', location.search);
      
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        navigate('/login?error=google_auth_failed');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        navigate('/login?error=no_code');
        return;
      }

      console.log('Authorization code received:', code.substring(0, 20) + '...');

      try {
        // Send authorization code to backend
        const response = await apiFetch('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ code })
        });

        console.log('Backend response:', response);

        if (response?.token && response?.user) {
          // Store auth token and user info
          localStorage.setItem('astroai_token', response.token);
          localStorage.setItem('astroai_user', JSON.stringify(response.user));
          console.log('Token stored in localStorage');
          console.log('User info stored:', response.user);
          console.log('Login successful, redirecting to dashboard');
          
          // Redirect to dashboard (onboarding will be available via "Getting Started" button)
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        } else {
          console.error('Invalid response from server:', response);
          navigate('/login?error=invalid_response');
        }
      } catch (err: any) {
        console.error('Google auth error:', err);
        navigate('/login?error=backend_error');
      }
    };

    handleGoogleCallback();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-custom-light-yellow flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-custom-yellow rounded-full mb-4">
          <svg className="w-8 h-8 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we sign you in with Google.</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
