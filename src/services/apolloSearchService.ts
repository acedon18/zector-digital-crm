// Apollo Search API backend endpoint for your CRM
// Place in src/api/searchPeople.ts (or your backend routes folder)

import axios from 'axios';
import { ApolloSearchParams, ApolloSearchResponse } from './apolloSearchTypes';

const APOLLO_API_KEY = import.meta.env.VITE_APOLLO_API_KEY || '';
const APOLLO_SEARCH_URL = 'https://api.apollo.io/v1/mixed/people/search';

/**
 * Search for people/leads using Apollo.io Search API
 * @param {object} params - Search parameters (title, company, location, etc.)
 * @returns {Promise<any>} - Apollo search results
 */
export async function searchPeopleWithApollo(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
  if (!APOLLO_API_KEY) {
    throw new Error('Apollo API key is not set in environment variables.');
  }
  try {
    const response = await axios.post(
      APOLLO_SEARCH_URL,
      params,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'Api-Key': APOLLO_API_KEY,
        },
      }
    );
    return response.data as ApolloSearchResponse;
  } catch (error) {
    console.error('Apollo Search API error:', error);
    throw error;
  }
}
