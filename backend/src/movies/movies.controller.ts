import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { MoviesService } from "./movies.service";
import {
  MovieDto,
  SearchMoviesQueryDto,
  PaginationQueryDto,
  SearchMoviesDataResponseDto,
  FavoritesDataResponseDto,
  MessageDataResponseDto,
} from "./dto";

@ApiTags("Movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get("search")
  @ApiOperation({ summary: "Search movies by title" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Movies found successfully",
    type: SearchMoviesDataResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid search query" })
  async searchMovies(
    @Query() searchQuery: SearchMoviesQueryDto
  ): Promise<SearchMoviesDataResponseDto> {
    return this.moviesService.getMovieByTitle(searchQuery.q, searchQuery.page);
  }

  @Post("favorites")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add a movie to favorites" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Movie added to favorites successfully",
    type: MessageDataResponseDto,
  })
  @ApiBadRequestResponse({ description: "Invalid movie data" })
  @ApiConflictResponse({ description: "Movie already exists in favorites" })
  addToFavorites(@Body() movieToAdd: MovieDto): MessageDataResponseDto {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove a movie from favorites" })
  @ApiParam({
    name: "imdbID",
    description: "The IMDb ID of the movie to remove",
    example: "tt0133093",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Movie removed from favorites successfully",
    type: MessageDataResponseDto,
  })
  @ApiNotFoundResponse({ description: "Movie not found in favorites" })
  removeFromFavorites(@Param("imdbID") imdbID: string): MessageDataResponseDto {
    return this.moviesService.removeFromFavorites(imdbID);
  }

  @Get("favorites/list")
  @ApiOperation({ summary: "Get paginated list of favorite movies" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Favorites retrieved successfully",
    type: FavoritesDataResponseDto,
  })
  getFavorites(
    @Query() paginationQuery: PaginationQueryDto
  ): FavoritesDataResponseDto {
    return this.moviesService.getFavorites(
      paginationQuery.page,
      paginationQuery.pageSize
    );
  }
}
