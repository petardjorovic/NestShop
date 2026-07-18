import { Injectable } from '@nestjs/common';
import { AdministratorService } from 'src/administrator/administrator.service';
import { Administrator } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly administratorService: AdministratorService) {}

  validateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    return this.administratorService.validateAdministrator(username, password);
  }
}
