import { Test, TestingModule } from "@nestjs/testing";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { SearchMoviesQueryDto, PaginationQueryDto, MovieDto } from "./dto";

describe(MoviesController.prototype.constructor.name, () => {
  let controller: MoviesController;
  let moviesService: jest.Mocked<MoviesService>;

  const mockMoviesService = {
    getMovieByTitle: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    getFavorites: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: mockMoviesService }],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get(MoviesService);
    jest.clearAllMocks();
  });

  describe(MoviesController.prototype.searchMovies.name, () => {
    it("must call moviesService.getMovieByTitle with query parameter", async () => {
      const searchQuery: SearchMoviesQueryDto = { q: "Matrix", page: 1 };
      mockMoviesService.getMovieByTitle.mockResolvedValue({
        data: { movies: [], count: 0, totalResults: "0" },
      });

      await controller.searchMovies(searchQuery);

      expect(moviesService.getMovieByTitle).toHaveBeenCalledWith("Matrix", 1);
    });

    it("must call moviesService.getMovieByTitle with page parameter", async () => {
      const searchQuery: SearchMoviesQueryDto = { q: "Matrix", page: 2 };
      mockMoviesService.getMovieByTitle.mockResolvedValue({
        data: { movies: [], count: 0, totalResults: "0" },
      });

      await controller.searchMovies(searchQuery);

      expect(moviesService.getMovieByTitle).toHaveBeenCalledWith("Matrix", 2);
    });

    it("must call moviesService.getMovieByTitle with undefined page when not provided", async () => {
      const searchQuery: SearchMoviesQueryDto = { q: "Matrix" };
      mockMoviesService.getMovieByTitle.mockResolvedValue({
        data: { movies: [], count: 0, totalResults: "0" },
      });

      await controller.searchMovies(searchQuery);

      expect(moviesService.getMovieByTitle).toHaveBeenCalledWith(
        "Matrix",
        undefined
      );
    });
  });

  describe(MoviesController.prototype.addToFavorites.name, () => {
    it("must call moviesService.addToFavorites with movie data", () => {
      const movieDto: MovieDto = {
        title: "Matrix",
        imdbID: "tt0133093",
        year: "1999",
        poster: "url",
      };
      mockMoviesService.addToFavorites.mockReturnValue({
        data: { message: "Movie added to favorites" },
      });

      controller.addToFavorites(movieDto);

      expect(moviesService.addToFavorites).toHaveBeenCalledWith(movieDto);
    });
  });

  describe(MoviesController.prototype.removeFromFavorites.name, () => {
    it("must call moviesService.removeFromFavorites with imdbID parameter", () => {
      const imdbID = "tt0133093";
      mockMoviesService.removeFromFavorites.mockReturnValue({
        data: { message: "Movie removed from favorites" },
      });

      controller.removeFromFavorites(imdbID);

      expect(moviesService.removeFromFavorites).toHaveBeenCalledWith(imdbID);
    });
  });

  describe(MoviesController.prototype.getFavorites.name, () => {
    it("must call moviesService.getFavorites with page parameter", () => {
      const paginationQuery: PaginationQueryDto = { page: 2, pageSize: 20 };
      mockMoviesService.getFavorites.mockReturnValue({
        data: {
          favorites: [],
          count: 0,
          totalResults: "0",
          currentPage: 2,
          totalPages: 0,
        },
      });

      controller.getFavorites(paginationQuery);

      expect(moviesService.getFavorites).toHaveBeenCalledWith(2, 20);
    });

    it("must call moviesService.getFavorites with pageSize parameter", () => {
      const paginationQuery: PaginationQueryDto = { page: 1, pageSize: 15 };
      mockMoviesService.getFavorites.mockReturnValue({
        data: {
          favorites: [],
          count: 0,
          totalResults: "0",
          currentPage: 1,
          totalPages: 0,
        },
      });

      controller.getFavorites(paginationQuery);

      expect(moviesService.getFavorites).toHaveBeenCalledWith(1, 15);
    });

    it("must call moviesService.getFavorites with undefined parameters when not provided", () => {
      const paginationQuery: PaginationQueryDto = {};
      mockMoviesService.getFavorites.mockReturnValue({
        data: {
          favorites: [],
          count: 0,
          totalResults: "0",
          currentPage: 1,
          totalPages: 0,
        },
      });

      controller.getFavorites(paginationQuery);

      expect(moviesService.getFavorites).toHaveBeenCalledWith(
        undefined,
        undefined
      );
    });
  });
});
