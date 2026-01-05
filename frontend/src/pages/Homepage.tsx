import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken, logout } from '../utils/cognitoAuth';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Homepage Component
 * Protected page that displays authenticated content
 */
export function Homepage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const idToken = tokenStorage.getIdToken();
    const user = getUserFromToken(idToken);
    setUserInfo(user);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <h1>Homepage</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            color: '#666',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main>
        <div style={{
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome!</h2>
          <p style={{ marginBottom: '1rem' }}>
            You have successfully authenticated with AWS Cognito.
          </p>
          
          {userInfo && (
            <div style={{
              marginTop: '1.5rem',
            }}>
              <h3 style={{ marginBottom: '0.5rem' }}>User Information:</h3>
              <pre style={{
                margin: 0,
                padding: '0.5rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.9rem',
              }}>
                {JSON.stringify({
                  sub: userInfo.sub,
                  email: userInfo.email,
                  name: userInfo.name,
                  email_verified: userInfo.email_verified,
                  'cognito:username': userInfo['cognito:username'],
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

