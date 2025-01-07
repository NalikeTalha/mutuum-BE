import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);


    const API_PREFIX = '/api';
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle('Mutuum presale backend')
        .setDescription('Mutuum presale backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    const PORT = process.env.PORT ?? 3000;

    await app.listen(PORT, async () => {
        console.log(`Server started listening: ${PORT}`)
    });
}
bootstrap();
