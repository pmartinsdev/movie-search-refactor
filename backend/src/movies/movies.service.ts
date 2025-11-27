import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { MovieDto } from "./dto/movie.dto";
import {
  SearchMoviesDataResponseDto,
  FavoritesDataResponseDto,
  MessageDataResponseDto,
  MovieResponseDto,
} from "./dto/movie-response.dto";
import { FavoritesRepository } from "./repositories/favorites.repository";
import {
  MovieNotFoundException,
  MovieAlreadyExistsException,
  InvalidSearchQueryException,
  ExternalApiException,
} from "../common/exceptions";

interface OmdbSearchResponse {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  private readonly omdbApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly favoritesRepository: FavoritesRepository
  ) {
    const apiKey = this.configService.get<string>("OMDB_API_KEY");
    if (!apiKey) {
      this.logger.warn(
        "OMDB_API_KEY not configured. Movie search will not work."
      );
    }
    this.omdbApiUrl = `http://www.omdbapi.com/?apikey=${apiKey || ""}`;
  }

  async searchMovies(
    title: string,
    page: number = 1
  ): Promise<SearchMoviesDataResponseDto> {
    this.validateSearchQuery(title);

    const encodedTitle = encodeURIComponent(title.trim());
    const validPage = Math.max(1, page);

    try {
      const response = await axios.get<OmdbSearchResponse>(
        `${this.omdbApiUrl}&s=${encodedTitle}&page=${validPage}`
      );

      if (response.data.Response === "False" || response.data.Error) {
        this.logger.debug(`OMDB API returned no results for: ${title}`);
        return this.buildSearchResponse([], "0");
      }

      const movies = response.data.Search || [];
      const formattedMovies = this.formatMoviesWithFavoriteStatus(movies);

      return this.buildSearchResponse(
        formattedMovies,
        response.data.totalResults || "0"
      );
    } catch (error) {
      this.handleApiError(error, "OMDB");
    }
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

  private handleApiError(error: unknown, serviceName: string): never {
    if (error instanceof AxiosError) {
      this.logger.error(
        `${serviceName} API error: ${error.message}`,
        error.stack
      );
      throw new ExternalApiException(serviceName, error.message);
    }
    throw error;
  }
}
