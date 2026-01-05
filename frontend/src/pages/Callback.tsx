import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCognitoCallback } from '../utils/cognitoAuth';

/**
 * Callback Page Component
 * Handles the OAuth callback from Cognito
 * Exchanges authorization code for tokens using PKCE and redirects to homepage
 */
export function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const success = await handleCognitoCallback();
      
      if (success) {
        // Clear the query parameters from URL
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/home', { replace: true });
      } else {
        // If callback failed, redirect to login
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <p>Processing authentication...</p>
    </div>
  );
}

