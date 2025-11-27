import {
  Movie,
  SearchMoviesResponse,
  FavoritesResponse,
  ApiErrorResponse,
} from "@/types/movie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/movies";

class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An unexpected error occurred";

    try {
      const errorData: ApiErrorResponse = await response.json();
      errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

function validateSearchQuery(query: string): void {
  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }
}

function validateImdbId(imdbId: string): void {
  if (!imdbId || imdbId.trim() === "") {
    throw new ApiError(400, "Movie ID is required");
  }
}

function validateMovie(movie: Movie): void {
  if (!movie.imdbID || movie.imdbID.trim() === "") {
    throw new ApiError(400, "Movie ID is required");
  }
  if (!movie.title || movie.title.trim() === "") {
    throw new ApiError(400, "Movie title is required");
  }
}

export const movieApi = {
  searchMovies: async (
    query: string,
    page: number = 1
  ): Promise<SearchMoviesResponse> => {
    validateSearchQuery(query);

    const encodedQuery = encodeURIComponent(query.trim());
    const validPage = Math.max(1, page);

    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodedQuery}&page=${validPage}`
    );

    return handleResponse<SearchMoviesResponse>(response);
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    const validPage = Math.max(1, page);

    const response = await fetch(
      `${API_BASE_URL}/favorites/list?page=${validPage}`
    );

    return handleResponse<FavoritesResponse>(response);
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    validateMovie(movie);

    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: movie.title,
        imdbID: movie.imdbID,
        year: movie.year,
        poster: movie.poster,
      }),
    });

    await handleResponse<{ data: { message: string } }>(response);
  },

  removeFromFavorites: async (imdbId: string): Promise<void> => {
    validateImdbId(imdbId);

    const response = await fetch(
      `${API_BASE_URL}/favorites/${encodeURIComponent(imdbId)}`,
      {
        method: "DELETE",
      }
    );

    await handleResponse<{ data: { message: string } }>(response);
  },
};

export { ApiError };
