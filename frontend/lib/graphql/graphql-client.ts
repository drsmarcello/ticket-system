// frontend/src/lib/graphql-client.ts (REPLACE)
import { GraphQLClient } from 'graphql-request';
import { TokenManager } from '@/utils/tokenManager';

class EnhancedGraphQLClient {
  private client: GraphQLClient;

  constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  // 🔄 Request method that always uses current token
  async request<T = any>(document: string, variables?: any): Promise<T> {
    // Always get fresh token before request
    const token = typeof window !== 'undefined' ? TokenManager.getAccessToken() : null;
    
    if (token) {
      this.client.setHeader('Authorization', `Bearer ${token}`);
    } else {
      this.client.setHeader('Authorization', '');
    }

    return this.client.request<T>(document, variables);
  }

  // Legacy support for setHeader
  setHeader(name: string, value: string) {
    this.client.setHeader(name, value);
  }
}

const client = new EnhancedGraphQLClient(
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://api.utilbox.de/graphql'
);

export { client };