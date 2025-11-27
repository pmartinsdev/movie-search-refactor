import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { MovieDto } from "../dto/movie.dto";

export interface FavoriteMovie {
  title: string;
  imdbID: string;
  year: string;
  poster: string;
}

@Injectable()
export class FavoritesRepository implements OnModuleInit {
  private readonly logger = new Logger(FavoritesRepository.name);
  private readonly dataDirectory: string;
  private readonly filePath: string;
  private favorites: FavoriteMovie[] = [];

  constructor() {
    this.dataDirectory = path.join(process.cwd(), "data");
    this.filePath = path.join(this.dataDirectory, "favorites.json");
  }

  onModuleInit(): void {
    this.ensureDataDirectoryExists();
    this.loadFromFile();
  }

  private ensureDataDirectoryExists(): void {
    if (!fs.existsSync(this.dataDirectory)) {
      this.logger.log(`Creating data directory: ${this.dataDirectory}`);
      fs.mkdirSync(this.dataDirectory, { recursive: true });
    }
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, "utf-8");
        const parsedData = JSON.parse(fileContent);

        if (!Array.isArray(parsedData)) {
          this.logger.warn(
            "Invalid favorites file format, initializing empty array",
          );
          this.favorites = [];
          return;
        }

        this.favorites = parsedData.filter(this.isValidFavoriteMovie);
        this.logger.log(`Loaded ${this.favorites.length} favorites from file`);
      } else {
        this.logger.log("Favorites file not found, initializing empty array");
        this.favorites = [];
        this.saveToFile();
      }
    } catch (error) {
      this.logger.error(
        `Error loading favorites: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      this.favorites = [];
    }
  }

  private isValidFavoriteMovie(movie: unknown): movie is FavoriteMovie {
    if (typeof movie !== "object" || movie === null) {
      return false;
    }
    const movieObj = movie as Record<string, unknown>;
    return (
      typeof movieObj.title === "string" &&
      typeof movieObj.imdbID === "string" &&
      (typeof movieObj.year === "string" ||
        typeof movieObj.year === "number") &&
      typeof movieObj.poster === "string"
    );
  }

  private saveToFile(): void {
    try {
      this.ensureDataDirectoryExists();
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.favorites, null, 2),
        "utf-8",
      );
      this.logger.log(`Saved ${this.favorites.length} favorites to file`);
    } catch (error) {
      this.logger.error(
        `Error saving favorites: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw new Error("Failed to save favorites to file");
    }
  }

  findAll(): FavoriteMovie[] {
    return [...this.favorites];
  }

  findByImdbId(imdbId: string): FavoriteMovie | undefined {
    return this.favorites.find(
      (movie) => movie.imdbID.toLowerCase() === imdbId.toLowerCase(),
    );
  }

  exists(imdbId: string): boolean {
    return this.favorites.some(
      (movie) => movie.imdbID.toLowerCase() === imdbId.toLowerCase(),
    );
  }

  add(movieDto: MovieDto): FavoriteMovie {
    const favoriteMovie: FavoriteMovie = {
      title: movieDto.title,
      imdbID: movieDto.imdbID,
      year: String(movieDto.year),
      poster: movieDto.poster,
    };

    this.favorites.push(favoriteMovie);
    this.saveToFile();

    return favoriteMovie;
  }

  remove(imdbId: string): boolean {
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(
      (movie) => movie.imdbID.toLowerCase() !== imdbId.toLowerCase(),
    );

    if (this.favorites.length < initialLength) {
      this.saveToFile();
      return true;
    }

    return false;
  }

  count(): number {
    return this.favorites.length;
  }

  findPaginated(
    page: number,
    pageSize: number,
  ): { items: FavoriteMovie[]; total: number; totalPages: number } {
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(1, pageSize);

    const startIndex = (validPage - 1) * validPageSize;
    const items = this.favorites.slice(startIndex, startIndex + validPageSize);
    const total = this.favorites.length;
    const totalPages = Math.ceil(total / validPageSize);

    return { items, total, totalPages };
  }
}
