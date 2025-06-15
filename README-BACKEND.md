# Zector Digital CRM Backend

This document provides instructions for setting up and running the backend server for the Zector Digital CRM Lead Tracking System.

## Backend Components

- `server.cjs` - The main Node.js Express server with MongoDB integration
- `db/connection.cjs` - MongoDB connection setup
- `db/models.cjs` - MongoDB schema definitions
- `seed-data.cjs` - Script to populate MongoDB with sample data
- `src/backend/trackingServer.ts` - TypeScript version (for development reference only)

## Running the Backend Server

### Prerequisites

- Node.js (v16+)
- MongoDB connection (Atlas or local)
- Environment variables set in `.env` file

### Environment Setup

Make sure your `.env` file contains the MongoDB connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/zector-digital-crm
PORT=3001
```

### Starting the Server

To start the backend server, run:

```bash
npm run backend
# or
npm run start:backend
```

The server will be available at http://localhost:3001

### API Endpoints

The following API endpoints are available:

#### Main Tracking Endpoint
- `POST /track` - Record visitor tracking data

#### Visitor Data
- `GET /api/visitors/realtime` - Get real-time active visitors
- `GET /api/visitors/sessions` - Get visitor sessions with filtering

#### Companies/Leads Data
- `GET /api/companies/leads` - Get all company leads
- `GET /api/companies/filtered` - Get filtered companies with advanced filtering
- `GET /api/visitors/companies` - Get all companies
- `GET /api/visitors/companies/recent` - Get recent company visitors
- `GET /api/visitors/companies/hot` - Get hot leads
- `GET /api/visitors/companies/:id` - Get specific company by ID
- `GET /api/visitors/companies/enriched` - Get companies with enrichment data

#### Utilities
- `GET /health` - Health check endpoint
- `GET /api/test` - Test endpoint

## Filtering Parameters

The `/api/companies/filtered` endpoint supports the following query parameters:

- `status` - Filter by status ('hot', 'warm', 'cold', or 'all')
- `industry` - Filter by industry
- `search` - Search term for name, domain, email, or website
- `sortBy` - Sort option ('lastVisit', 'score', or 'totalVisits')
- `limit` - Number of results to return (default: 20)

Example:
```
GET /api/companies/filtered?status=hot&sortBy=score&limit=10
```

## Seeding Test Data

To populate the MongoDB database with sample company data:

```bash
node seed-data.cjs
```

## Debugging

The server includes extensive logging for debugging purposes. Check the console output for information about:

- Database connection status
- API endpoint access
- Query parameters and MongoDB operations
- Error messages
