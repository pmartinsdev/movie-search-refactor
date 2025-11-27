import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

export class PaginationQueryDto {
  @ApiProperty({
    description: "Page number for pagination",
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === "string" || typeof value === "number") {
      const parsed = parseInt(String(value), 10);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  })
  @IsInt()
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === "string" || typeof value === "number") {
      const parsed = parseInt(String(value), 10);
      return isNaN(parsed) ? 10 : parsed;
    }
    return 10;
  })
  @IsInt()
  @Min(1, { message: "Page size must be at least 1" })
  @Max(100, { message: "Page size must not exceed 100" })
  pageSize?: number = 10;
}
