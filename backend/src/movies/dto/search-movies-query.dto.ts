import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Min, IsInt } from "class-validator";
import { Transform } from "class-transformer";

export class SearchMoviesQueryDto {
  @ApiProperty({
    name: "q",
    description: "Search query for movie titles",
    example: "Matrix",
  })
  @IsString({ message: "Search query must be a string" })
  @IsNotEmpty({ message: "Search query is required" })
  q: string;

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
}
