# Movie Search Application

## Overview

A full-stack movie search application that allows users to search for movies using the OMDb API and manage their favorite movies. Built with NestJS (backend) and Next.js (frontend).

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **Jest** - Testing

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+
- An OMDb API key (get one free at [omdbapi.com](http://www.omdbapi.com/apikey.aspx))

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
OMDB_API_KEY=your_api_key_here
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

Start the backend:

```bash
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Optionally create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/movies
```

Start the frontend:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## API Documentation

Swagger documentation is available at: `http://localhost:3001/api/docs`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/movies/search` | Search movies by title |
| GET | `/movies/favorites/list` | Get paginated favorites |
| POST | `/movies/favorites` | Add movie to favorites |
| DELETE | `/movies/favorites/:imdbID` | Remove from favorites |

## Application Features

- 🔍 Search for movies using the OMDb API
- ⭐ Add/remove movies to favorites
- 📄 Paginated results
- 📱 Responsive UI design
- 🔄 Real-time favorite status updates
- ⚡ Optimized performance with memoization
- ♿ Accessible UI components

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── exceptions/       # Custom exceptions
│   │   │   ├── filters/          # Exception filters
│   │   │   └── interceptors/     # Logging interceptor
│   │   └── movies/
│   │       ├── dto/              # Data transfer objects
│   │       ├── integrations/     # OMDB API integration
│   │       └── repositories/     # Data access layer
│   ├── data/                     # JSON storage
│   └── CHANGES.md                # Backend changes documentation
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # API layer
│   │   ├── providers/            # Context providers
│   │   └── types/                # TypeScript types
│   └── CHANGES.md                # Frontend changes documentation
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `OMDB_API_KEY` | OMDb API key (required) | - |
| `PORT` | Server port | `3001` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/movies` |

## Running Tests

### Backend

```bash
cd backend
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run e2e tests
```

## Architecture Principles

### SOLID Principles Applied

- **Single Responsibility**: Each class/module has one purpose
- **Open/Closed**: Extensible through dependency injection
- **Liskov Substitution**: Interfaces define contracts
- **Interface Segregation**: Specific interfaces for specific needs
- **Dependency Inversion**: Dependencies injected, not hardcoded

### Clean Code Practices

- Meaningful names for variables and functions
- Small, focused functions
- Type safety throughout
- Proper error handling
- No code comments (self-documenting code)

## Documentation

For detailed information about the refactoring changes:

- [Backend Changes](./backend/CHANGES.md)
- [Frontend Changes](./frontend/CHANGES.md)
