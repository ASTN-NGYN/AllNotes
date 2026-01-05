/**
 * AWS Cognito authentication utilities with PKCE (Proof Key for Code Exchange)
 */

import { tokenStorage } from './tokenStorage';

// Cognito configuration from environment variables
const COGNITO_CONFIG = {
  userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID,
  region: import.meta.env.VITE_AWS_COGNITO_REGION,
  domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN,
  redirectUri: import.meta.env.VITE_AWS_COGNITO_REDIRECT_URI,
};

const CODE_VERIFIER_KEY = 'cognito_code_verifier';

/**
 * Generate a random code verifier for PKCE (43-128 characters, URL-safe)
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate code challenge from code verifier using SHA256
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Build the Cognito Hosted UI login URL with PKCE
 */
export async function buildCognitoLoginUrl(): Promise<string> {
  const { domain, clientId, redirectUri } = COGNITO_CONFIG;

  if (!domain || !clientId || !redirectUri) {
    throw new Error('Missing required Cognito configuration. Please check your .env file.');
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier in sessionStorage for later use in token exchange
  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid email profile phone',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  // Use /login endpoint as shown in Cognito console
  return `https://${domain}/login?${params.toString()}`;
}

/**
 * Parse authorization code from Cognito callback URL query parameters
 */
function parseAuthorizationCode(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
}

/**
 * Decode JWT token payload (without verification)
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is valid (not expired)
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

/**
 * Get user information from ID token
 */
export function getUserFromToken(idToken: string | null): any | null {
  if (!idToken) {
    return null;
  }

  try {
    return decodeJWT(idToken);
  } catch (error) {
    return null;
  }
}

/**
 * Exchange authorization code for tokens using PKCE
 */
async function exchangeCodeForTokens(authorizationCode: string): Promise<{ idToken: string; accessToken: string } | null> {
  const { domain, clientId, redirectUri } = COGNITO_CONFIG;
  const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);

  if (!codeVerifier) {
    console.error('Code verifier not found in session storage');
    return null;
  }

  // Construct token endpoint URL
  const tokenEndpoint = `https://${domain}/oauth2/token`;

  // Exchange authorization code for tokens
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: authorizationCode,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      return null;
    }

    const data = await response.json();
    
    if (!data.id_token || !data.access_token) {
      return null;
    }

    // Clear code verifier after successful exchange
    sessionStorage.removeItem(CODE_VERIFIER_KEY);

    return {
      idToken: data.id_token,
      accessToken: data.access_token,
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

/**
 * Handle Cognito callback - exchange authorization code for tokens using PKCE
 */
export async function handleCognitoCallback(): Promise<boolean> {
  const authorizationCode = parseAuthorizationCode();
  
  if (!authorizationCode) {
    return false;
  }

  const tokens = await exchangeCodeForTokens(authorizationCode);
  
  if (!tokens) {
    return false;
  }

  // Validate tokens before storing
  if (!isTokenValid(tokens.idToken) || !isTokenValid(tokens.accessToken)) {
    return false;
  }

  tokenStorage.setTokens(tokens.idToken, tokens.accessToken);
  return true;
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
  const idToken = tokenStorage.getIdToken();
  return isTokenValid(idToken);
}

/**
 * Logout - clear tokens
 */
export function logout(): void {
  tokenStorage.clearTokens();
}

