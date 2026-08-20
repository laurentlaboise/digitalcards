import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    rawBody: true, // Needed for Stripe webhook signature verification
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const apiPrefix = configService.get<string>('apiPrefix', 'api/v1');

  // Global prefix
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'health/ready', 'health/metrics', 's/:shortCode', 'p/:profileId'],
  });

  // CORS
  app.enableCors({
    origin: [
      configService.get('urls.frontend'),
      'http://localhost:3001',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger API Documentation
  if (configService.get('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TapCard API')
      .setDescription('TapCard digital business card platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management')
      .addTag('Organizations', 'Organization management')
      .addTag('Profiles', 'Digital business card profiles')
      .addTag('Sharing', 'QR codes, short links, sharing')
      .addTag('NFC', 'NFC device management')
      .addTag('Analytics', 'Profile analytics and tracking')
      .addTag('Leads', 'Lead capture and management')
      .addTag('Products', 'Product catalog')
      .addTag('Orders', 'Order management')
      .addTag('Subscriptions', 'Subscription billing')
      .addTag('Teams', 'Team collaboration')
      .addTag('Integrations', 'Third-party integrations')
      .addTag('Admin', 'Platform administration')
      .addTag('Health', 'Health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger documentation available at /docs');
  }

  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`API prefix: ${apiPrefix}`);
  logger.log(`Environment: ${configService.get('nodeEnv')}`);
}

bootstrap();
