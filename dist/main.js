"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const API_PREFIX = '/api';
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors({
        origin: '*',
        methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
        allowedHeaders: '*',
        exposedHeaders: '*',
        credentials: true,
        maxAge: 3600
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Mutuum presale backend')
        .setDescription('Mutuum presale backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, documentFactory);
    const PORT = process.env.PORT ?? 3000;
    await app.listen(PORT, async () => {
        console.log(`Server started listening: ${PORT}`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map