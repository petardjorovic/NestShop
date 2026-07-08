import { Controller } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { Serialize } from 'src/decorators/serialize.decorators';
import { UserDto } from '../../dtos/user/user.dto';

@Serialize(UserDto)
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
