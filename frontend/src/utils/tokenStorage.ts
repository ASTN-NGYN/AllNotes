/**
 * Token storage utilities for managing Cognito tokens
 */

const ID_TOKEN_KEY = 'cognito_id_token';
const ACCESS_TOKEN_KEY = 'cognito_access_token';

export const tokenStorage = {
  /**
   * Store ID token and access token
   */
  setTokens(idToken: string, accessToken: string): void {
    localStorage.setItem(ID_TOKEN_KEY, idToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  /**
   * Get ID token
   */
  getIdToken(): string | null {
    return localStorage.getItem(ID_TOKEN_KEY);
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return !!this.getIdToken() && !!this.getAccessToken();
  },
};

