# Frontend Refactoring Changes

## Overview

This document details the refactoring changes made to the frontend application following Clean Code principles and React best practices.

---

## 1. Types (`src/types/movie.ts`)

### Changes

- Fixed `year` type from `number` to `string` to match backend response
- Fixed `totalResults` in `FavoritesResponse` from `number` to `string` for consistency
- Added `ApiErrorResponse` interface for typed error handling
- Removed all BUG comments

### Why

- Type consistency between frontend and backend prevents runtime errors
- Explicit error typing improves error handling

---

## 2. API Layer (`src/lib/api.ts`)

### Changes

- Added configurable API URL via `NEXT_PUBLIC_API_URL` environment variable
- Created `ApiError` custom error class with status code
- Implemented `handleResponse<T>` generic function for consistent response handling
- Added validation functions: `validateSearchQuery`, `validateImdbId`, `validateMovie`
- Added `encodeURIComponent` for query parameters
- Properly checks `response.ok` before parsing JSON
- Handles both string and array error messages from backend
- Removed all BUG comments

### Why

- Centralized error handling reduces code duplication
- Input validation prevents invalid API calls
- URL encoding fixes issues with special characters
- Custom error class provides better error context

---

## 3. Query Provider (`src/providers/QueryProvider.tsx`)

### Changes

- Fixed QueryClient instantiation using `useState` to prevent recreation on every render
- Added `refetchOnWindowFocus: false` to prevent unnecessary refetches
- Added mutation default options with `retry: 0`

### Why

- Prevents memory leaks and unnecessary re-renders
- Provides consistent query behavior across the app

---

## 4. Hooks (`src/hooks/useMovies.ts`)

### Changes

- Created `QUERY_KEYS` constant object for centralized query key management
- Added explicit TypeScript types to all hooks (`useQuery<ResponseType, Error>`)
- Optimized query invalidation to target specific keys instead of invalidating all queries
- `useAddToFavorites` and `useRemoveFromFavorites` now only invalidate:
  - All favorites queries
  - Search queries (to update `isFavorite` status)
- Removed all BUG comments

### Why

- Centralized query keys prevent typos and make refactoring easier
- Selective invalidation improves performance
- Explicit types provide better IDE support and catch errors at compile time

---

## 5. Components

### MovieCard (`src/components/MovieCard.tsx`)

#### Changes

- Wrapped with `React.memo` for performance optimization
- Added `isLoading` prop to show loading state during mutations
- Added `imageError` state with `onError` handler for broken images
- Added `lazy` loading attribute to images
- Button is disabled during loading to prevent double-clicks
- Added `aria-label` for accessibility
- Added loading spinner animation during mutation
- Used `useCallback` for event handlers to prevent unnecessary re-renders
- Renamed from lowercase import

#### Why

- Memoization prevents unnecessary re-renders when parent updates
- Loading state provides better UX feedback
- Image error handling prevents broken image displays
- Accessibility improvements for screen readers

### SearchBar (`src/components/SearchBar.tsx`)

#### Changes

- Renamed from `searchBar.tsx` to follow PascalCase convention
- Wrapped with `React.memo`
- Used `useCallback` for event handlers
- Added proper validation before submitting (trims whitespace)
- Added explicit type for form event

#### Why

- Consistent naming convention
- Performance optimization
- Prevents empty searches

### Pagination (`src/components/Pagination.tsx`)

#### Changes

- Renamed from `pagination.tsx` to follow PascalCase convention
- Wrapped with `React.memo`
- Used `useMemo` for page calculation
- Used `useCallback` for all click handlers
- Extracted `MAX_VISIBLE_PAGES` as constant
- Added `aria-label` and `aria-current` for accessibility
- Returns `null` early if `totalPages <= 1`

#### Why

- Consistent naming convention
- Memoization prevents recalculation on every render
- Better accessibility support
- Cleaner conditional rendering

---

## 6. Pages

### Search Page (`src/app/page.tsx`)

#### Changes

- Removed unnecessary `useEffect` import
- Added `loadingMovieId` state for individual movie loading states
- Used `useMemo` for `totalPages` calculation
- Used `useCallback` for all handlers
- Added error display when API call fails
- Simplified conditional rendering with computed boolean variables
- Added `RESULTS_PER_PAGE` constant
- Properly handles error state display
- Updated imports to use PascalCase component names

#### Why

- Loading state prevents race conditions during mutations
- Memoization improves performance
- Error handling improves UX
- Cleaner code with extracted variables for conditionals

### Favorites Page (`src/app/favorites/page.tsx`)

#### Changes

- Removed unused `useAddToFavorites` hook (favorites page only removes)
- Added `loadingMovieId` state for individual movie loading states
- Used `useMemo` for `totalResults` calculation
- Used `useCallback` for handlers
- Added loading state display
- Added error display
- Simplified conditional rendering
- Updated imports to use PascalCase component names

#### Why

- Removed dead code
- Consistent loading and error handling with search page
- Better code organization

---

## 7. Environment Variables

### New Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/movies` |

---

## Clean Code Principles Applied

### 1. Single Responsibility Principle (SRP)

- Each hook has a single purpose
- API functions handle one operation each
- Components are focused on rendering

### 2. DRY (Don't Repeat Yourself)

- Centralized `QUERY_KEYS` constant
- Reusable `handleResponse` function
- Shared validation functions

### 3. Meaningful Names

- Clear function and variable names
- Descriptive component names
- Self-documenting code

### 4. Small Functions

- Each function does one thing
- Easy to test and maintain

### 5. Error Handling

- All API calls have proper error handling
- Errors are displayed to users
- Custom error class for context

### 6. Type Safety

- Explicit TypeScript types throughout
- Interfaces for all data structures
- Generic types for reusable functions

---

## Performance Optimizations

1. **React.memo** on all presentational components
2. **useMemo** for expensive calculations
3. **useCallback** for event handlers
4. **useState** for QueryClient to prevent recreation
5. **Selective query invalidation** instead of invalidating all
6. **Lazy loading** for images

---

## Accessibility Improvements

1. Added `aria-label` to interactive elements
2. Added `aria-current` for current page in pagination
3. Proper button disabled states

---

## Breaking Changes

None. All endpoints and functionality remain the same.

---

## How to Test

1. Start the backend server
2. Set environment variable (optional):
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:3001/movies
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Test features:
   - Search for movies
   - Add/remove favorites
   - Navigate pagination
   - Verify error handling by disconnecting backend

