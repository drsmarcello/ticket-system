// frontend/src/utils/tokenManager.ts (SSR-SAFE VERSION)
import { client } from '@/lib/graphql';

export class TokenManager {
  private static ACCESS_TOKEN_KEY = 'accessToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';
  private static refreshPromise: Promise<boolean> | null = null;

  // 🌐 SSR-safe localStorage check
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // 💾 Store tokens
  static setTokens(accessToken: string, refreshToken: string): void {
    if (!this.isClient()) return;
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // 🔑 Get access token
  static getAccessToken(): string | null {
    if (!this.isClient()) return null;
    
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // 🔄 Get refresh token
  static getRefreshToken(): string | null {
    if (!this.isClient()) return null;
    
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // 🗑️ Clear all tokens
  static clearTokens(): void {
    if (!this.isClient()) return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // Legacy cleanup
    localStorage.removeItem('token');
  }

  // ✅ Check if user is authenticated
  static isAuthenticated(): boolean {
    if (!this.isClient()) return false;
    
    return !!this.getAccessToken();
  }

  // 🔄 Migrate legacy token if exists
  static migrateLegacyToken(): void {
    if (!this.isClient()) return;
    
    const legacyToken = localStorage.getItem('token');
    if (legacyToken && !this.getAccessToken()) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, legacyToken);
      localStorage.removeItem('token');
    }
  }

  // 🕒 Check if token is expired or will expire soon
  static isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp <= (now + bufferMinutes * 60);
    } catch {
      return true;
    }
  }

  // 🔄 Refresh access token
  static async refreshAccessToken(): Promise<boolean> {
    if (!this.isClient()) return false;
    
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    this.refreshPromise = this.performRefresh(refreshToken);
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    
    return result;
  }

  private static async performRefresh(refreshToken: string): Promise<boolean> {
    try {
      const REFRESH_TOKEN_MUTATION = `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
            user {
              id
              name
              email
              role
            }
          }
        }
      `;

      const response = await client.request<any>(REFRESH_TOKEN_MUTATION, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.refreshToken;
      
      this.setTokens(accessToken, newRefreshToken);
      client.setHeader("Authorization", `Bearer ${accessToken}`);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  // 🔄 Get valid access token (with auto-refresh)
  static async getValidAccessToken(): Promise<string | null> {
    if (!this.isClient()) return null;
    
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // Check if token needs refresh
    if (this.isTokenExpired(accessToken)) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return null;
      }
      return this.getAccessToken();
    }

    return accessToken;
  }

  // 🚀 Initialize token management
  static async initialize(): Promise<boolean> {
    if (!this.isClient()) return false;
    
    this.migrateLegacyToken();
    
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return false;
    }

    // Check if we need to refresh immediately
    if (this.isTokenExpired(accessToken)) {
      return await this.refreshAccessToken();
    }

    client.setHeader("Authorization", `Bearer ${accessToken}`);
    return true;
  }
}