import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movieApi } from "@/lib/api";
import { Movie, SearchMoviesResponse, FavoritesResponse } from "@/types/movie";

const QUERY_KEYS = {
  movies: ["movies"] as const,
  search: (query: string, page: number) =>
    [...QUERY_KEYS.movies, "search", query, page] as const,
  favorites: (page: number) =>
    [...QUERY_KEYS.movies, "favorites", page] as const,
  allFavorites: () => [...QUERY_KEYS.movies, "favorites"] as const,
};

export function useSearchMovies(
  query: string,
  page: number = 1,
  enabled: boolean = false
) {
  return useQuery<SearchMoviesResponse, Error>({
    queryKey: QUERY_KEYS.search(query, page),
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.trim().length > 0,
    retry: 1,
  });
}

export function useFavorites(page: number = 1) {
  return useQuery<FavoritesResponse, Error>({
    queryKey: QUERY_KEYS.favorites(page),
    queryFn: () => movieApi.getFavorites(page),
    retry: 1,
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Movie>({
    mutationFn: (movie: Movie) => movieApi.addToFavorites(movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allFavorites() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.movies,
        predicate: (query) => query.queryKey[1] === "search",
      });
    },
  });
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (imdbId: string) => movieApi.removeFromFavorites(imdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allFavorites() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.movies,
        predicate: (query) => query.queryKey[1] === "search",
      });
    },
  });
}
