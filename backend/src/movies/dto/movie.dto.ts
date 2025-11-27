import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class MovieDto {
  @ApiProperty({
    description: "The title of the movie",
    example: "The Matrix",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "The IMDb unique identifier",
    example: "tt0133093",
  })
  @IsNotEmpty()
  @IsString()
  imdbID: string;

  @ApiProperty({
    description: "The release year of the movie",
    example: "1999",
  })
  @IsNotEmpty()
  @IsString()
  year: string;

  @ApiProperty({
    description: "URL to the movie poster image",
    example: "https://example.com/poster.jpg",
    required: false,
  })
  @IsOptional()
  @IsString()
  poster: string;
}
