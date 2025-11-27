import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { OmdbIntegrationService } from "./omdb-integration.service";
import { ExternalApiException } from "../../common/exceptions";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe(OmdbIntegrationService.name, () => {
  let service: OmdbIntegrationService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue("test-api-key"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmdbIntegrationService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OmdbIntegrationService>(OmdbIntegrationService);
    jest.clearAllMocks();
  });

  describe(OmdbIntegrationService.prototype.searchMovies.name, () => {
    it("must return movies array when search is successful", async () => {
      const mockResponse = {
        data: {
          Search: [
            {
              Title: "Matrix",
              Year: "1999",
              imdbID: "tt0133093",
              Poster: "url",
              Type: "movie",
            },
          ],
          totalResults: "1",
          Response: "True",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMovies("Matrix", 1);

      expect(result.movies).toHaveLength(1);
    });

    it("must return correct totalResults when search is successful", async () => {
      const mockResponse = {
        data: {
          Search: [
            {
              Title: "Matrix",
              Year: "1999",
              imdbID: "tt0133093",
              Poster: "url",
              Type: "movie",
            },
          ],
          totalResults: "100",
          Response: "True",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMovies("Matrix", 1);

      expect(result.totalResults).toBe("100");
    });

    it("must return empty array when OMDB returns no results", async () => {
      const mockResponse = {
        data: {
          Response: "False",
          Error: "Movie not found!",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMovies("nonexistent", 1);

      expect(result.movies).toHaveLength(0);
    });

    it("must return zero totalResults when OMDB returns no results", async () => {
      const mockResponse = {
        data: {
          Response: "False",
          Error: "Movie not found!",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.searchMovies("nonexistent", 1);

      expect(result.totalResults).toBe("0");
    });

    it("must encode title in URL", async () => {
      const mockResponse = {
        data: {
          Search: [],
          totalResults: "0",
          Response: "True",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.searchMovies("Matrix & Friends", 1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("Matrix%20%26%20Friends")
      );
    });

    it("must use minimum page value when page is invalid", async () => {
      const mockResponse = {
        data: {
          Search: [],
          totalResults: "0",
          Response: "True",
        },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.searchMovies("Matrix", -1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("page=1")
      );
    });

    it("must throw ExternalApiException when axios throws error", async () => {
      const axiosError = new AxiosError("Network error");
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(service.searchMovies("Matrix", 1)).rejects.toThrow(
        ExternalApiException
      );
    });
  });
});

