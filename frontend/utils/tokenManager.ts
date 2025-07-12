// 🔄 Token Management Utility
// frontend/src/utils/tokenManager.ts

export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';

  // 💾 Store tokens
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // 🔑 Get access token
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // 🔄 Get refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 🗑️ Clear all tokens
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Legacy cleanup
    localStorage.removeItem('token');
  }

  // ✅ Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // 🔄 Migrate legacy token if exists
  static migrateLegacyToken(): void {
    const legacyToken = localStorage.getItem('token');
    if (legacyToken && !this.getAccessToken()) {
      // Move legacy token to accessToken temporarily
      localStorage.setItem(this.ACCESS_TOKEN_KEY, legacyToken);
      localStorage.removeItem('token');
    }
  }
}

// Auto-migrate on import (nur im Browser)
if (typeof window !== 'undefined') {
  TokenManager.migrateLegacyToken();
}