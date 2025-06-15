// Type definitions for environment variables
// This ensures TypeScript recognizes our environment variables

declare namespace NodeJS {
  interface ProcessEnv {
    // Vite environment variables that need to be mapped to process.env
    VITE_API_ENDPOINT?: string;
    VITE_API_BASE_URL?: string;
    VITE_CLEARBIT_API_KEY?: string;
    VITE_HUNTER_API_KEY?: string;
    
    // Standard Node.js variables
    NODE_ENV?: 'development' | 'production' | 'test';
    PORT?: string;
    
    // MongoDB connection string
    MONGO_URI?: string;
  }
}
