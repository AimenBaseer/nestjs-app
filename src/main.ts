import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('The Reframe Fintech')
    .setDescription('The Reframe Fintech API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  


  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
