import { ConflictException } from "@nestjs/common";

export class MovieAlreadyExistsException extends ConflictException {
  constructor(imdbId: string) {
    super(`Movie with imdbID '${imdbId}' already exists in favorites`);
  }
}
