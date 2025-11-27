import { Test, TestingModule } from "@nestjs/testing";
import { MoviesService } from "./movies.service";
import { FavoritesRepository } from "./repositories/favorites.repository";
import { OmdbIntegrationService } from "./integrations/omdb-integration.service";
import {
  MovieNotFoundException,
  MovieAlreadyExistsException,
  InvalidSearchQueryException,
} from "../common/exceptions";

describe(MoviesService.name, () => {
  let service: MoviesService;
  let favoritesRepository: jest.Mocked<FavoritesRepository>;
  let omdbIntegrationService: jest.Mocked<OmdbIntegrationService>;

  const mockFavoritesRepository = {
    exists: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    findPaginated: jest.fn(),
    findAll: jest.fn(),
  };

  const mockOmdbIntegrationService = {
    searchMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: FavoritesRepository, useValue: mockFavoritesRepository },
        {
          provide: OmdbIntegrationService,
          useValue: mockOmdbIntegrationService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    favoritesRepository = module.get(FavoritesRepository);
    omdbIntegrationService = module.get(OmdbIntegrationService);
    jest.clearAllMocks();
  });

  describe(MoviesService.prototype.searchMovies.name, () => {
    it("must return movies array with correct length", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [
          {
            Title: "Matrix",
            Year: "1999",
            imdbID: "tt0133093",
            Poster: "url",
            Type: "movie",
          },
        ],
        totalResults: "1",
      });
      mockFavoritesRepository.exists.mockReturnValue(false);

      const result = await service.searchMovies("Matrix", 1);

      expect(result.data.movies).toHaveLength(1);
    });

    it("must return movie with correct title", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [
          {
            Title: "Matrix",
            Year: "1999",
            imdbID: "tt0133093",
            Poster: "url",
            Type: "movie",
          },
        ],
        totalResults: "1",
      });
      mockFavoritesRepository.exists.mockReturnValue(false);

      const result = await service.searchMovies("Matrix", 1);

      expect(result.data.movies[0].title).toBe("Matrix");
    });

    it("must throw InvalidSearchQueryException when query is empty", async () => {
      await expect(service.searchMovies("", 1)).rejects.toThrow(
        InvalidSearchQueryException
      );
    });

    it("must return empty movies array when OMDB returns no results", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [],
        totalResults: "0",
      });

      const result = await service.searchMovies("nonexistent", 1);

      expect(result.data.movies).toHaveLength(0);
    });

    it("must mark movie as favorite when it exists in favorites", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [
          {
            Title: "Matrix",
            Year: "1999",
            imdbID: "tt0133093",
            Poster: "url",
            Type: "movie",
          },
        ],
        totalResults: "1",
      });
      mockFavoritesRepository.exists.mockReturnValue(true);

      const result = await service.searchMovies("Matrix", 1);

      expect(result.data.movies[0].isFavorite).toBe(true);
    });

    it("must call favoritesRepository.exists for each movie", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [
          {
            Title: "Matrix",
            Year: "1999",
            imdbID: "tt0133093",
            Poster: "url",
            Type: "movie",
          },
        ],
        totalResults: "1",
      });
      mockFavoritesRepository.exists.mockReturnValue(false);

      await service.searchMovies("Matrix", 1);

      expect(favoritesRepository.exists).toHaveBeenCalledWith("tt0133093");
    });

    it("must call omdbIntegrationService.searchMovies with title and page", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [],
        totalResults: "0",
      });

      await service.searchMovies("Matrix", 2);

      expect(omdbIntegrationService.searchMovies).toHaveBeenCalledWith(
        "Matrix",
        2
      );
    });
  });

  describe(MoviesService.prototype.getMovieByTitle.name, () => {
    it("must call searchMovies with title and page", async () => {
      mockOmdbIntegrationService.searchMovies.mockResolvedValue({
        movies: [],
        totalResults: "0",
      });

      await service.getMovieByTitle("Matrix", 2);

      expect(omdbIntegrationService.searchMovies).toHaveBeenCalledWith(
        "Matrix",
        2
      );
    });
  });

  describe(MoviesService.prototype.addToFavorites.name, () => {
    it("must call favoritesRepository.exists with imdbID", () => {
      const movieDto = {
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      };
      mockFavoritesRepository.exists.mockReturnValue(false);
      mockFavoritesRepository.add.mockReturnValue({
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      });

      service.addToFavorites(movieDto);

      expect(favoritesRepository.exists).toHaveBeenCalledWith("tt0133093");
    });

    it("must call favoritesRepository.add when movie does not exist", () => {
      const movieDto = {
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      };
      mockFavoritesRepository.exists.mockReturnValue(false);
      mockFavoritesRepository.add.mockReturnValue({
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      });

      service.addToFavorites(movieDto);

      expect(favoritesRepository.add).toHaveBeenCalledWith(movieDto);
    });

    it("must throw MovieAlreadyExistsException when movie already exists", () => {
      const movieDto = {
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      };
      mockFavoritesRepository.exists.mockReturnValue(true);

      expect(() => service.addToFavorites(movieDto)).toThrow(
        MovieAlreadyExistsException
      );
    });

    it("must return message when movie is added successfully", () => {
      const movieDto = {
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      };
      mockFavoritesRepository.exists.mockReturnValue(false);
      mockFavoritesRepository.add.mockReturnValue({
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      });

      const result = service.addToFavorites(movieDto);

      expect(result.data.message).toBe("Movie added to favorites");
    });
  });

  describe(MoviesService.prototype.removeFromFavorites.name, () => {
    it("must call favoritesRepository.remove with imdbId", () => {
      mockFavoritesRepository.remove.mockReturnValue(true);

      service.removeFromFavorites("tt0133093");

      expect(favoritesRepository.remove).toHaveBeenCalledWith("tt0133093");
    });

    it("must throw MovieNotFoundException when movie does not exist", () => {
      mockFavoritesRepository.remove.mockReturnValue(false);

      expect(() => service.removeFromFavorites("nonexistent")).toThrow(
        MovieNotFoundException
      );
    });

    it("must throw InvalidSearchQueryException when imdbId is empty", () => {
      expect(() => service.removeFromFavorites("")).toThrow(
        InvalidSearchQueryException
      );
    });

    it("must return message when movie is removed successfully", () => {
      mockFavoritesRepository.remove.mockReturnValue(true);

      const result = service.removeFromFavorites("tt0133093");

      expect(result.data.message).toBe("Movie removed from favorites");
    });
  });

  describe(MoviesService.prototype.getFavorites.name, () => {
    it("must call favoritesRepository.findPaginated with page parameter", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [
          { title: "Matrix", imdbID: "tt0133093", year: "1999", poster: "url" },
        ],
        total: 1,
        totalPages: 1,
      });

      service.getFavorites(2, 10);

      expect(favoritesRepository.findPaginated).toHaveBeenCalledWith(2, 10);
    });

    it("must call favoritesRepository.findPaginated with pageSize parameter", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [],
        total: 0,
        totalPages: 0,
      });

      service.getFavorites(1, 20);

      expect(favoritesRepository.findPaginated).toHaveBeenCalledWith(1, 20);
    });

    it("must call favoritesRepository.findPaginated with default values when not provided", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [],
        total: 0,
        totalPages: 0,
      });

      service.getFavorites();

      expect(favoritesRepository.findPaginated).toHaveBeenCalledWith(1, 10);
    });

    it("must return favorites with correct count", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [
          { title: "Matrix", imdbID: "tt0133093", year: "1999", poster: "url" },
        ],
        total: 1,
        totalPages: 1,
      });

      const result = service.getFavorites(1, 10);

      expect(result.data.favorites).toHaveLength(1);
    });

    it("must return correct totalPages", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [],
        total: 0,
        totalPages: 1,
      });

      const result = service.getFavorites(1, 10);

      expect(result.data.totalPages).toBe(1);
    });

    it("must handle invalid page numbers by using minimum value", () => {
      mockFavoritesRepository.findPaginated.mockReturnValue({
        items: [],
        total: 0,
        totalPages: 0,
      });

      service.getFavorites(-1, -5);

      expect(favoritesRepository.findPaginated).toHaveBeenCalledWith(1, 1);
    });
  });
});
