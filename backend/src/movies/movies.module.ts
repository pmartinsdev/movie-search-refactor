import { Module } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";
import { FavoritesRepository } from "./repositories/favorites.repository";
import { OmdbIntegrationService } from "./integrations/omdb-integration.service";

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [MoviesService, FavoritesRepository, OmdbIntegrationService],
  exports: [MoviesService],
})
export class MoviesModule {}
