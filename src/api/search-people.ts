// API route for frontend to search Apollo leads
// Place in src/api/search-people.ts (or your API routes folder)
import type { NextApiRequest, NextApiResponse } from 'next';
import { searchPeopleWithApollo } from '../services/apolloSearchService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const params = req.body;
    const results = await searchPeopleWithApollo(params);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Apollo Search API error', details: error instanceof Error ? error.message : error });
  }
}
