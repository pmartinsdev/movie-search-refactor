import * as fs from "fs";
import * as path from "path";
import { FavoritesRepository } from "./favorites.repository";

jest.mock("fs");

describe(FavoritesRepository.prototype.constructor.name, () => {
  let repository: FavoritesRepository;

  const createMockMovie = (
    title: string,
    imdbID: string,
    year: string,
    poster: string,
  ) => ({
    title,
    imdbID,
    year,
    poster,
  });

  const setupFileExists = (exists: boolean) => {
    (fs.existsSync as jest.Mock).mockReturnValue(exists);
  };

  const setupReadFile = (content: unknown) => {
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(content));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FavoritesRepository();
  });

  describe(FavoritesRepository.prototype.onModuleInit.name, () => {
    it("must call fs.mkdirSync when data directory does not exist", () => {
      setupFileExists(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      repository.onModuleInit();

      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it("must load favorites from file when file exists", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);

      repository.onModuleInit();

      expect(repository.findAll()).toHaveLength(1);
    });

    it("must initialize empty array when file does not exist", () => {
      setupFileExists(false);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

      repository.onModuleInit();

      expect(repository.findAll()).toHaveLength(0);
    });
  });

  describe(FavoritesRepository.prototype.findAll.name, () => {
    it("must return all favorites", () => {
      const mockData = [
        createMockMovie("Movie 1", "tt123", "2020", "url1"),
        createMockMovie("Movie 2", "tt456", "2021", "url2"),
      ];
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe(FavoritesRepository.prototype.findByImdbId.name, () => {
    it("must return movie when it exists", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findByImdbId("tt123");

      expect(result?.imdbID).toBe("tt123");
    });

    it("must return undefined when movie does not exist", () => {
      setupFileExists(false);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const result = repository.findByImdbId("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe(FavoritesRepository.prototype.exists.name, () => {
    it("must return true when movie exists", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.exists("tt123");

      expect(result).toBe(true);
    });

    it("must return false when movie does not exist", () => {
      setupFileExists(false);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const result = repository.exists("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe(FavoritesRepository.prototype.add.name, () => {
    it("must call fs.writeFileSync when adding movie", () => {
      setupFileExists(true);
      setupReadFile([]);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const movieDto = createMockMovie("New Movie", "tt789", "2022", "url");
      repository.add(movieDto);

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("must add movie to favorites", () => {
      setupFileExists(true);
      setupReadFile([]);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const movieDto = createMockMovie("New Movie", "tt789", "2022", "url");
      repository.add(movieDto);

      expect(repository.exists("tt789")).toBe(true);
    });
  });

  describe(FavoritesRepository.prototype.remove.name, () => {
    it("must return true when movie is removed", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const result = repository.remove("tt123");

      expect(result).toBe(true);
    });

    it("must remove movie from favorites", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      repository.remove("tt123");

      expect(repository.exists("tt123")).toBe(false);
    });

    it("must return false when movie does not exist", () => {
      setupFileExists(false);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      repository.onModuleInit();

      const result = repository.remove("nonexistent");

      expect(result).toBe(false);
    });
  });

  describe(FavoritesRepository.prototype.count.name, () => {
    it("must return correct count of favorites", () => {
      const mockData = [
        createMockMovie("Movie 1", "tt123", "2020", "url1"),
        createMockMovie("Movie 2", "tt456", "2021", "url2"),
      ];
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.count();

      expect(result).toBe(2);
    });
  });

  describe(FavoritesRepository.prototype.findPaginated.name, () => {
    it("must return correct number of items", () => {
      const mockData = Array.from({ length: 15 }, (_, i) =>
        createMockMovie(`Movie ${i}`, `tt${i}`, "2020", "url"),
      );
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findPaginated(1, 10);

      expect(result.items).toHaveLength(10);
    });

    it("must return correct total count", () => {
      const mockData = Array.from({ length: 15 }, (_, i) =>
        createMockMovie(`Movie ${i}`, `tt${i}`, "2020", "url"),
      );
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findPaginated(1, 10);

      expect(result.total).toBe(15);
    });

    it("must return correct total pages", () => {
      const mockData = Array.from({ length: 15 }, (_, i) =>
        createMockMovie(`Movie ${i}`, `tt${i}`, "2020", "url"),
      );
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findPaginated(1, 10);

      expect(result.totalPages).toBe(2);
    });

    it("must handle invalid page number by using minimum value", () => {
      const mockData = [createMockMovie("Test", "tt123", "2020", "url")];
      setupFileExists(true);
      setupReadFile(mockData);
      repository.onModuleInit();

      const result = repository.findPaginated(-1, 10);

      expect(result.items).toHaveLength(1);
    });
  });
});
