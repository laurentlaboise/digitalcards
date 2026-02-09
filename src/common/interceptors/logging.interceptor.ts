import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = (request as any).user?.id || 'anonymous';
    const startTime = Date.now();

    this.logger.log(
      `Incoming ${method} ${url} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${duration}ms - User: ${userId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || error?.statusCode || 500;

          this.logger.error(
            `${method} ${url} ${statusCode} - ${duration}ms - User: ${userId} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
