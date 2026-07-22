import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AdministratorService } from 'src/administrator/administrator.service';
import { Administrator } from 'src/generated/prisma/client';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginAdministratorDto } from 'src/administrator/dtos/login.administartor.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdministrator(
    username: string,
    password: string,
  ): Promise<Administrator> {
    const admin = await this.administratorService.findByUsername(username);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async login(data: LoginAdministratorDto) {
    const administartor = await this.validateAdministrator(
      data.username,
      data.password,
    );
    const payload: JwtPayload = {
      sub: administartor.administratorId,
      username: administartor.username,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
    };
  }

  //TODO
  // refresh(refreshToken:string){}

  // logout(sessionId:number){}

  // logoutAll(administratorId:number){}

  // generateAccessToken(...){}

  // generateRefreshToken(...){}
}
