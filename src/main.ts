import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin:["http://localhost:3001", "https://niyo.org", /\.niyo\.org$/]});
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Niyo Task App')
    .setDescription('The Niyo Task App backend API for a Task Management App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);
  await app.listen(3000);
}
bootstrap().catch(error=>console.log(error));
