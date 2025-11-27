"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useSearchMovies,
  useAddToFavorites,
  useRemoveFromFavorites,
} from "@/hooks/useMovies";
import { Movie } from "@/types/movie";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";

const RESULTS_PER_PAGE = 10;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMovieId, setLoadingMovieId] = useState<string | null>(null);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const totalPages = useMemo(() => {
    if (!searchResults?.data.totalResults) return 0;
    const total = parseInt(searchResults.data.totalResults, 10);
    return Math.ceil(total / RESULTS_PER_PAGE);
  }, [searchResults?.data.totalResults]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchEnabled(true);
    setCurrentPage(1);
  }, []);

  const handleToggleFavorite = useCallback(
    async (movie: Movie) => {
      if (loadingMovieId) return;

      setLoadingMovieId(movie.imdbID);
      try {
        if (movie.isFavorite) {
          await removeFromFavorites.mutateAsync(movie.imdbID);
        } else {
          await addToFavorites.mutateAsync(movie);
        }
      } finally {
        setLoadingMovieId(null);
      }
    },
    [addToFavorites, removeFromFavorites, loadingMovieId]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
  );

  const movies = searchResults?.data.movies ?? [];
  const hasMovies = movies.length > 0;
  const showEmptyState = !isLoading && !hasMovies && !searchQuery;
  const showNoResults = !isLoading && !hasMovies && searchQuery;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
              Movie Finder
            </h1>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Error: {error.message}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Searching for movies...</p>
          </div>
        )}

        {showEmptyState && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
            <p className="text-muted-foreground">
              Search for your favorite movies and add them to your favorites
            </p>
          </div>
        )}

        {showNoResults && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No movies found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {!isLoading && hasMovies && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  isFavorite={movie.isFavorite ?? false}
                  onToggleFavorite={handleToggleFavorite}
                  isLoading={loadingMovieId === movie.imdbID}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
