import { ServiceUnavailableException } from "@nestjs/common";

export class ExternalApiException extends ServiceUnavailableException {
  constructor(serviceName: string, originalError?: string) {
    super(
      `External service '${serviceName}' is unavailable${originalError ? `: ${originalError}` : ""}`,
    );
  }
}
