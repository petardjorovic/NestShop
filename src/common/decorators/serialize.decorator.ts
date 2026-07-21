import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { SerializeInterceptor } from 'src/common/interceptors/serialize.interceptors';

export const SERIALIZE_DTO = 'serialize_dto';

export function Serialize(dto: ClassConstructor<any>) {
  return applyDecorators(
    SetMetadata(SERIALIZE_DTO, dto),
    UseInterceptors(SerializeInterceptor),
  );
}
