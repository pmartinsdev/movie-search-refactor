import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3002",
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle("Movie Search API")
    .setDescription("API for searching movies and managing favorites")
    .setVersion("1.0")
    .addTag("Movies")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;

  try {
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(
      `Swagger documentation available at: http://localhost:${port}/api/docs`
    );
  } catch (error) {
    logger.error(
      `Failed to start application: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
}

void bootstrap();
