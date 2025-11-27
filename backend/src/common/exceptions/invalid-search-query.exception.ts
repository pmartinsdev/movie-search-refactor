import { BadRequestException } from "@nestjs/common";

export class InvalidSearchQueryException extends BadRequestException {
  constructor() {
    super("Search query must be a non-empty string");
  }
}
