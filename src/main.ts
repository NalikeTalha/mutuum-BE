import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const API_PREFIX = '/api';
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(new ValidationPipe());

    // Enable CORS with all origins
    app.enableCors({
        origin: '*',              // Allow all origins
        methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',  // Allow all common HTTP methods
        allowedHeaders: '*',      // Allow all headers
        exposedHeaders: '*',      // Expose all headers
        credentials: true,        // Allow credentials
        maxAge: 3600             // Cache preflight requests for 1 hour
    });

    const config = new DocumentBuilder()
        .setTitle('Mutuum presale backend')
        .setDescription('Mutuum presale backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    console.log('process.env.PORT',process.env.PORT)
    const PORT = process.env.PORT ?? 3000;

    await app.listen(PORT, async () => {
        console.log(`Server started listening: ${PORT}`)
    });
}
bootstrap();
