import { ExecutionContext, CallHandler } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { LoggingInterceptor } from "./logging.interceptor";

describe(LoggingInterceptor.prototype.constructor.name, () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: {
    method: string;
    url: string;
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    params: Record<string, unknown>;
  };
  let mockResponse: {
    statusCode: number;
  };

  const createMockExecutionContext = () =>
    ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext);

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    mockRequest = {
      method: "GET",
      url: "/test",
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      statusCode: 200,
    };
    mockExecutionContext = createMockExecutionContext();
    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  describe(LoggingInterceptor.prototype.intercept.name, () => {
    it("must return observable from handler", (done) => {
      const responseData = { data: "test" };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual(responseData);
          done();
        },
      });
    });

    it("must call handler.handle when intercepting", (done) => {
      const responseData = { data: "test" };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {},
        complete: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it("must propagate error when handler throws", (done) => {
      const error = new Error("Test error");
      (mockCallHandler.handle as jest.Mock).mockReturnValue(
        throwError(() => error),
      );

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err.message).toBe("Test error");
          done();
        },
      });
    });
  });
});
