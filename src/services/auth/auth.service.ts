import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginAdministratorDto } from 'src/dtos/administrator/login.administartor.dto';
import { AdministratorService } from './../administrator/administrator.service';
import { ApiResponse } from 'src/misc/api.response.class';
import { LoginInfoAdministratorDto } from 'src/dtos/administrator/login.info.administartor.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    try {
      token = await this.jwtService.signAsync({
        sub: administrator.administratorId,
        username: administrator.username,
        ip: ipAddress,
        ua: userAgent,
      });
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
