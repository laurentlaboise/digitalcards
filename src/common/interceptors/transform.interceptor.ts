import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface TransformedResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<TransformedResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;

    return next.handle().pipe(
      map((data) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: url,
          method,
        },
      })),
    );
  }
}
