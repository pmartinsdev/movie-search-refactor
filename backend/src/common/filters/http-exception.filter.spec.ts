import { HttpException, HttpStatus, BadRequestException } from "@nestjs/common";
import { HttpExceptionFilter } from "./http-exception.filter";

describe(HttpExceptionFilter.prototype.constructor.name, () => {
  let filter: HttpExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockRequest: {
    url: string;
    method: string;
  };
  let mockArgumentsHost: {
    switchToHttp: jest.Mock;
    getArgByIndex: jest.Mock;
    getArgs: jest.Mock;
    getType: jest.Mock;
    switchToRpc: jest.Mock;
    switchToWs: jest.Mock;
  };

  const createMockArgumentsHost = () => ({
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  });

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: "/test",
      method: "GET",
    };
    mockArgumentsHost = createMockArgumentsHost();
  });

  describe(HttpExceptionFilter.prototype.catch.name, () => {
    it("must call response.status with correct status code for HttpException", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it("must call response.json with correct statusCode for HttpException", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
        }),
      );
    });

    it("must call response.json with correct message for HttpException", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Test error",
        }),
      );
    });

    it("must call response.json with correct path for HttpException", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: "/test",
        }),
      );
    });

    it("must call response.json with correct method for HttpException", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("must call response.status with INTERNAL_SERVER_ERROR for unknown exceptions", () => {
      const exception = new Error("Unknown error");

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it("must call response.json with correct statusCode for unknown exceptions", () => {
      const exception = new Error("Unknown error");

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    });

    it("must call response.json with correct message for unknown exceptions", () => {
      const exception = new Error("Unknown error");

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Unknown error",
        }),
      );
    });

    it("must extract message array from validation errors", () => {
      const exception = new BadRequestException({
        message: ["field1 is required", "field2 must be a string"],
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ["field1 is required", "field2 must be a string"],
        }),
      );
    });

    it("must include timestamp in error response", () => {
      const exception = new HttpException("Test error", HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
