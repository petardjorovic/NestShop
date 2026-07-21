import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {}
