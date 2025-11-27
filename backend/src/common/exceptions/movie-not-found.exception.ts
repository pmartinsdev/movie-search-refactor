import { NotFoundException } from "@nestjs/common";

export class MovieNotFoundException extends NotFoundException {
  constructor(imdbId: string) {
    super(`Movie with imdbID '${imdbId}' not found`);
  }
}
