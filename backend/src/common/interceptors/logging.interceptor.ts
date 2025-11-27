import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body, query, params } = request as {
      method: string;
      url: string;
      body: Record<string, unknown>;
      query: Record<string, unknown>;
      params: Record<string, unknown>;
    };

    const startTime = Date.now();

    this.logger.log(
      `[REQUEST] ${method} ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[RESPONSE] ${method} ${url} - Status: ${response.statusCode} - Duration: ${duration}ms - Response: ${JSON.stringify(data)}`
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[ERROR] ${method} ${url} - Duration: ${duration}ms - Error: ${error.message}`
          );
        },
      })
    );
  }
}
