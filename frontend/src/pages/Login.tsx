import { buildCognitoLoginUrl } from '../utils/cognitoAuth';

/**
 * Login Page Component
 * Displays a login button that redirects to AWS Cognito Hosted UI
 */
export function Login() {
  const handleLogin = async () => {
    try {
      const loginUrl = await buildCognitoLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error building Cognito login URL:', error);
      alert('Configuration error: Please check your Cognito settings.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome</h1>
        <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#666' }}>
          Please sign in to continue
        </p>
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
          }}
        >
          Sign in with AWS Cognito
        </button>
      </div>
    </div>
  );
}

