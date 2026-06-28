import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from 'src/decorators/serialize.decorators';
import { UserDto } from './dtos/user.dto';

@Serialize(UserDto)
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
