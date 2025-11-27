export interface Movie {
  title: string;
  imdbID: string;
  year: string;
  poster: string;
  isFavorite?: boolean;
}

export interface SearchMoviesResponse {
  data: {
    movies: Movie[];
    count: number;
    totalResults: string;
  };
}

export interface FavoritesResponse {
  data: {
    favorites: Movie[];
    count: number;
    totalResults: string;
    currentPage: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
}
