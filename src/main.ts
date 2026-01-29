import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; //ADDED
import { NestExpressApplication } from "@nestjs/platform-express" //for ip address
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,           // Strips properties not in DTO
      forbidNonWhitelisted: true, // Throws error if extra properties sent (recommended)
      transform: true,            // Auto-transform payloads to DTO instances
    })); //ADDED
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // your frontend URL
    credentials: true, // if sending cookies or auth headers
  });

  //SWAGGER DOCS
   const config = new DocumentBuilder()
    .setTitle('Music Streaming Platform')
    .setDescription('Music Streaming And Social Platform for Musicians')
    .setVersion('1.0')
    .addTag('music')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('music-documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();