import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      skipMissingProperties: true
    })
  );
  const configService: ConfigService = app.get(ConfigService);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
