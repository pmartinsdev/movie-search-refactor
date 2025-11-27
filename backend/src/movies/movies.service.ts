import { Injectable, Logger } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import {
  SearchMoviesDataResponseDto,
  FavoritesDataResponseDto,
  MessageDataResponseDto,
  MovieResponseDto,
} from "./dto/movie-response.dto";
import { FavoritesRepository } from "./repositories/favorites.repository";
import {
  OmdbIntegrationService,
  OmdbMovie,
} from "./integrations/omdb-integration.service";
import {
  MovieNotFoundException,
  MovieAlreadyExistsException,
  InvalidSearchQueryException,
} from "../common/exceptions";

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly omdbIntegrationService: OmdbIntegrationService,
    private readonly favoritesRepository: FavoritesRepository
  ) {}

  async searchMovies(
    title: string,
    page: number = 1
  ): Promise<SearchMoviesDataResponseDto> {
    this.validateSearchQuery(title);

    const { movies, totalResults } =
      await this.omdbIntegrationService.searchMovies(title, page);

    const formattedMovies = this.formatMoviesWithFavoriteStatus(movies);

    return this.buildSearchResponse(formattedMovies, totalResults);
  }

  async getMovieByTitle(
    title: string,
    page: number = 1
  ): Promise<SearchMoviesDataResponseDto> {
    return this.searchMovies(title, page);
  }

  addToFavorites(movieDto: MovieDto): MessageDataResponseDto {
    if (this.favoritesRepository.exists(movieDto.imdbID)) {
      throw new MovieAlreadyExistsException(movieDto.imdbID);
    }

    this.favoritesRepository.add(movieDto);
    this.logger.log(`Movie added to favorites: ${movieDto.imdbID}`);

    return {
      data: {
        message: "Movie added to favorites",
      },
    };
  }

  removeFromFavorites(imdbId: string): MessageDataResponseDto {
    if (!imdbId || imdbId.trim() === "") {
      throw new InvalidSearchQueryException();
    }

    const removed = this.favoritesRepository.remove(imdbId);

    if (!removed) {
      throw new MovieNotFoundException(imdbId);
    }

    this.logger.log(`Movie removed from favorites: ${imdbId}`);

    return {
      data: {
        message: "Movie removed from favorites",
      },
    };
  }

  getFavorites(
    page: number = 1,
    pageSize: number = 10
  ): FavoritesDataResponseDto {
    const validPage = Math.max(1, page);
    const validPageSize = Math.min(Math.max(1, pageSize), 100);

    const { items, total, totalPages } = this.favoritesRepository.findPaginated(
      validPage,
      validPageSize
    );

    return {
      data: {
        favorites: items,
        count: items.length,
        totalResults: String(total),
        currentPage: validPage,
        totalPages,
      },
    };
  }

  private validateSearchQuery(query: string): void {
    if (!query || query.trim() === "") {
      throw new InvalidSearchQueryException();
    }
  }

  private formatMoviesWithFavoriteStatus(
    movies: OmdbMovie[]
  ): MovieResponseDto[] {
    return movies.map((movie) => ({
      title: movie.Title,
      imdbID: movie.imdbID,
      year: movie.Year,
      poster: movie.Poster,
      isFavorite: this.favoritesRepository.exists(movie.imdbID),
    }));
  }

  private buildSearchResponse(
    movies: MovieResponseDto[],
    totalResults: string
  ): SearchMoviesDataResponseDto {
    return {
      data: {
        movies,
        count: movies.length,
        totalResults,
      },
    };
  }
}
