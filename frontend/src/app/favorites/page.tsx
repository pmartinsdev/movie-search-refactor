"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { useFavorites, useRemoveFromFavorites } from "@/hooks/useMovies";
import { Movie } from "@/types/movie";

export default function FavoritesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMovieId, setLoadingMovieId] = useState<string | null>(null);

  const { data: favorites, isLoading, error } = useFavorites(currentPage);
  const removeFromFavorites = useRemoveFromFavorites();

  const totalResults = useMemo(() => {
    return parseInt(favorites?.data.totalResults ?? "0", 10);
  }, [favorites?.data.totalResults]);

  const handleToggleFavorite = useCallback(
    async (movie: Movie) => {
      if (loadingMovieId) return;

      setLoadingMovieId(movie.imdbID);
      try {
        await removeFromFavorites.mutateAsync(movie.imdbID);
      } finally {
        setLoadingMovieId(null);
      }
    },
    [removeFromFavorites, loadingMovieId]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const totalPages = favorites?.data.totalPages ?? 1;
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [favorites?.data.totalPages]
  );

  const favoriteMovies = favorites?.data.favorites ?? [];
  const totalPages = favorites?.data.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl text-white font-bold bg-clip-text">
              My Favorites
            </h1>
          </div>
          <p className="text-center text-muted-foreground">
            {totalResults} {totalResults === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error: {error.message}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading favorites...</p>
          </div>
        )}

        {!isLoading && totalResults === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding movies to your favorites from the search page
            </p>
            <Link href="/">
              <Button className="bg-gradient-primary">Search Movies</Button>
            </Link>
          </div>
        )}

        {!isLoading && totalResults > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoriteMovies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  isFavorite={true}
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
