import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { FavoritesRepository } from "./repositories/favorites.repository";

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [MoviesService, FavoritesRepository],
  exports: [MoviesService],
})
export class MoviesModule {}
