import { ApiProperty } from "@nestjs/swagger";

export class MovieResponseDto {
  @ApiProperty({ example: "The Matrix" })
  title: string;

  @ApiProperty({ example: "tt0133093" })
  imdbID: string;

  @ApiProperty({ example: "1999" })
  year: string;

  @ApiProperty({ example: "https://example.com/poster.jpg" })
  poster: string;

  @ApiProperty({ example: true })
  isFavorite: boolean;
}

export class SearchMoviesResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  movies: MovieResponseDto[];

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ example: "100" })
  totalResults: string;
}

export class SearchMoviesDataResponseDto {
  @ApiProperty({ type: SearchMoviesResponseDto })
  data: SearchMoviesResponseDto;
}

export class FavoriteMovieDto {
  @ApiProperty({ example: "The Matrix" })
  title: string;

  @ApiProperty({ example: "tt0133093" })
  imdbID: string;

  @ApiProperty({ example: "1999" })
  year: string;

  @ApiProperty({ example: "https://example.com/poster.jpg" })
  poster: string;
}

export class FavoritesResponseDto {
  @ApiProperty({ type: [FavoriteMovieDto] })
  favorites: FavoriteMovieDto[];

  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ example: "100" })
  totalResults: string;

  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class FavoritesDataResponseDto {
  @ApiProperty({ type: FavoritesResponseDto })
  data: FavoritesResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: "Movie added to favorites" })
  message: string;
}

export class MessageDataResponseDto {
  @ApiProperty({ type: MessageResponseDto })
  data: MessageResponseDto;
}
