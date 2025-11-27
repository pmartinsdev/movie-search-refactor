# Backend Refactoring Changes

## Overview

This document describes all the changes made during the backend refactoring process, following SOLID principles, Clean Code practices, and NestJS best practices.

---

## Issues Found and Fixed

### 1. Bug Fixes

#### 1.1 OMDB API Response Comparison
- **Problem**: The code compared `Response` field as boolean (`false`) when OMDB API returns it as a string (`"False"` or `"True"`).
- **Fix**: Changed comparison to use string value `'False'` instead of boolean `false`.

#### 1.2 Missing URL Encoding
- **Problem**: Search queries were not URL-encoded, causing issues with special characters.
- **Fix**: Added `encodeURIComponent()` for all search query parameters.

#### 1.3 HttpException Being Returned Instead of Thrown
- **Problem**: `addToFavorites` and `removeFromFavorites` were returning `HttpException` objects instead of throwing them.
- **Fix**: Changed to throw proper custom exceptions.

#### 1.4 Missing Input Validation
- **Problem**: No validation for query parameters, page numbers, or request bodies.
- **Fix**: Added DTOs with `class-validator` decorators and global `ValidationPipe`.

#### 1.5 Hardcoded CORS Origins
- **Problem**: CORS origins were hardcoded to `localhost:3000`.
- **Fix**: Made configurable via `CORS_ORIGINS` environment variable.

#### 1.6 Invalid Page Number Handling
- **Problem**: Page numbers could be NaN, negative, or zero, causing unexpected behavior.
- **Fix**: Added validation with minimum value enforcement (`Math.max(1, page)`).

#### 1.7 Favorites File Operations Without Error Handling
- **Problem**: File read/write operations had no error handling and could crash.
- **Fix**: Added try-catch blocks, directory creation check, and proper error logging.

#### 1.8 Case-Sensitive IMDb ID Comparison
- **Problem**: Movie comparisons were case-sensitive.
- **Fix**: Added case-insensitive comparison using `toLowerCase()`.

---

## Architecture Improvements

### 2. Separation of Concerns (Single Responsibility Principle)

#### 2.1 Created FavoritesRepository
- **Location**: `src/movies/repositories/favorites.repository.ts`
- **Purpose**: Handles all data persistence operations for favorites
- **Benefits**: 
  - Service layer no longer handles file I/O
  - Easier to test and mock
  - Can be easily replaced with a database in the future

#### 2.2 Custom Exceptions
- **Location**: `src/common/exceptions/`
- **Created**:
  - `MovieNotFoundException`: When a movie is not found in favorites
  - `MovieAlreadyExistsException`: When trying to add a duplicate favorite
  - `InvalidSearchQueryException`: For empty or invalid search queries
  - `ExternalApiException`: For OMDB API failures
- **Benefits**: Clear, specific error messages and proper HTTP status codes

### 3. Error Handling (Open/Closed Principle)

#### 3.1 Global Exception Filter
- **Location**: `src/common/filters/http-exception.filter.ts`
- **Features**:
  - Catches all exceptions globally
  - Provides consistent error response format
  - Logs errors with stack traces
  - Handles validation errors from class-validator

### 4. Logging System

#### 4.1 Logging Interceptor
- **Location**: `src/common/interceptors/logging.interceptor.ts`
- **Features**:
  - Logs all incoming requests with method, URL, body, query, and params
  - Logs all responses with status code, duration, and response data
  - Logs errors with duration and error message

---

## New Features

### 5. Swagger Documentation

- **Endpoint**: `/api/docs`
- **Features**:
  - Full API documentation with request/response schemas
  - Interactive testing interface
  - Parameter descriptions and examples

### 6. Input Validation

#### 6.1 DTOs with Validation
- **SearchMoviesQueryDto**: Validates search query and page number
- **PaginationQueryDto**: Validates page and pageSize with min/max constraints
- **MovieDto**: Validates movie data for favorites

#### 6.2 Global ValidationPipe
- Whitelist: Only allowed properties are accepted
- ForbidNonWhitelisted: Extra properties cause validation error
- Transform: Automatic type conversion

---

## File Structure Changes

### New Files Created

```
src/
├── common/
│   ├── exceptions/
│   │   ├── index.ts
│   │   ├── external-api.exception.ts
│   │   ├── invalid-search-query.exception.ts
│   │   ├── movie-already-exists.exception.ts
│   │   └── movie-not-found.exception.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── http-exception.filter.spec.ts
│   └── interceptors/
│       ├── logging.interceptor.ts
│       └── logging.interceptor.spec.ts
├── movies/
│   ├── dto/
│   │   ├── index.ts
│   │   ├── movie.dto.ts (refactored)
│   │   ├── movie-response.dto.ts
│   │   ├── pagination-query.dto.ts
│   │   └── search-movies-query.dto.ts
│   ├── repositories/
│   │   ├── favorites.repository.ts
│   │   └── favorites.repository.spec.ts
│   ├── movies.controller.ts (refactored)
│   ├── movies.controller.spec.ts
│   ├── movies.service.ts (refactored)
│   ├── movies.service.spec.ts
│   └── movies.module.ts (refactored)
└── main.ts (refactored)
```

---

## Dependencies Added

```json
{
  "@nestjs/swagger": "^8.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x"
}
```

---

## Test Coverage

### Unit Tests Created (40 tests total)

#### FavoritesRepository (12 tests)
- Directory creation
- File loading and saving
- CRUD operations
- Pagination
- Edge cases (invalid data, missing files)

#### MoviesService (10 tests)
- Search movies with OMDB API
- Add/remove favorites
- Pagination
- Error handling
- Favorite status marking

#### MoviesController (6 tests)
- All endpoint handlers
- Parameter passing
- Response handling

#### HttpExceptionFilter (4 tests)
- HTTP exception handling
- Unknown exception handling
- Validation error extraction
- Response format

#### LoggingInterceptor (3 tests)
- Request logging
- Response logging
- Error logging

---

## API Changes

### Endpoint Compatibility

All endpoints maintain backwards compatibility with the frontend:
- `GET /movies/search?q=...&page=...` - Search movies
- `POST /movies/favorites` - Add to favorites
- `DELETE /movies/favorites/:imdbID` - Remove from favorites
- `GET /movies/favorites/list?page=...` - Get favorites

### Response Format Improvements

All responses now follow a consistent format:
- Success: `{ data: { ... } }`
- Error: `{ statusCode, timestamp, path, method, message }`

---

## Environment Variables

### New Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000` |

### Existing Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `OMDB_API_KEY` | OMDB API key | Required |

---

## SOLID Principles Applied

1. **Single Responsibility**: Each class has one purpose (Repository for data, Service for logic, Controller for HTTP)
2. **Open/Closed**: Exception filter handles all exceptions without modifying existing code
3. **Liskov Substitution**: Custom exceptions extend NestJS exceptions properly
4. **Interface Segregation**: DTOs are specific to each use case
5. **Dependency Inversion**: Service depends on Repository abstraction, not file system directly

---

## Clean Code Practices Applied

1. **Meaningful names**: Variables and functions have descriptive names
2. **Small functions**: Each function does one thing
3. **No comments in code**: Code is self-documenting
4. **Error handling**: All edge cases are handled properly
5. **Consistent formatting**: Code follows NestJS conventions
6. **Type safety**: Full TypeScript typing throughout

---

## How to Test

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- --testPathPattern=movies.service

# Start the server
npm run start:dev

# Access Swagger documentation
open http://localhost:3001/api/docs
```

