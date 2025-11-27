import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { ExternalApiException } from "../../common/exceptions";

export interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface SearchMoviesResult {
  movies: OmdbMovie[];
  totalResults: string;
}

@Injectable()
export class OmdbIntegrationService {
  private readonly logger = new Logger(OmdbIntegrationService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("OMDB_API_KEY");
    if (!apiKey) {
      this.logger.warn(
        "OMDB_API_KEY not configured. Movie search will not work."
      );
    }
    this.baseUrl = `http://www.omdbapi.com/?apikey=${apiKey || ""}`;
  }

  async searchMovies(title: string, page: number): Promise<SearchMoviesResult> {
    const encodedTitle = encodeURIComponent(title.trim());
    const validPage = Math.max(1, page);

    try {
      const response = await axios.get<OmdbSearchResponse>(
        `${this.baseUrl}&s=${encodedTitle}&page=${validPage}`
      );

      if (response.data.Response === "False" || response.data.Error) {
        this.logger.debug(`OMDB API returned no results for: ${title}`);
        return {
          movies: [],
          totalResults: "0",
        };
      }

      return {
        movies: response.data.Search || [],
        totalResults: response.data.totalResults || "0",
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  private handleApiError(error: unknown): never {
    if (error instanceof AxiosError) {
      this.logger.error(`OMDB API error: ${error.message}`, error.stack);
      throw new ExternalApiException("OMDB", error.message);
    }
    throw error;
  }
}

