import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AdministratorService } from './../administrator/administrator.service';
import { LoginInfoAdministratorDto } from 'src/dtos/administrator/login.info.administartor.dto';
import { LoginAdministratorDto } from 'src/dtos/administrator/login.administartor.dto';
import { JwtDataAdministratorDto } from 'src/dtos/administrator/jwt.data.administrator.dto';
import { ApiResponse } from 'src/misc/api.response.class';

@Injectable()
export class AuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    data: LoginAdministratorDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ApiResponse | LoginInfoAdministratorDto> {
    const administrator = await this.administratorService.findByUsername(
      data.username,
    );

    if (!administrator) {
      return new ApiResponse('error', -1101);
    }

    let isPasswordValid: boolean;

    try {
      isPasswordValid = await argon2.verify(
        administrator.passwordHash,
        data.password,
      );
    } catch (error) {
      console.error(error);
      return new ApiResponse('error', -1003);
    }

    if (!isPasswordValid) {
      return new ApiResponse('error', -1102);
    }

    let token: string = '';
    const jwtData = new JwtDataAdministratorDto(
      administrator.administratorId,
      administrator.username,
      ipAddress,
      userAgent,
    );

    try {
      token = await this.jwtService.signAsync(jwtData.toPlainObject());
    } catch (error) {
      console.error(error);
      return new ApiResponse('error', -1004);
    }

    const responseObject = new LoginInfoAdministratorDto(
      administrator.administratorId,
      administrator.username,
      token,
    );

    return responseObject;
  }
}
