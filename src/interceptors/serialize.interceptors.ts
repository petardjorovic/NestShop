import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { SERIALIZE_DTO } from 'src/decorators/serialize.decorator';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const dto = this.reflector.getAllAndOverride(SERIALIZE_DTO, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      map((data) => {
        if (!dto) {
          return data;
        }

        return plainToInstance(dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
