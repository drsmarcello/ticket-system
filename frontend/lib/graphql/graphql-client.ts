import { GraphQLClient } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

export class GraphQLClientInstance {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(API_URL);
  }

  async request<T = any>(document: string, variables?: any): Promise<T> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      this.client.setHeaders(headers);
      
      return await this.client.request<T>(document, variables);
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;
    }
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.client.setHeader('Authorization', `Bearer ${token}`);
    } else {
      this.client.setHeader('Authorization', '');
    }
  }
}

export const client = new GraphQLClientInstance();