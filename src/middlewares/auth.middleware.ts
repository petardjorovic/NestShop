import {
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { JwtDataAdministratorDto } from 'src/dtos/administrator/jwt.data.administrator.dto';
import { Administrator } from 'src/generated/prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }

    const token = authHeader.slice(7);

    let jwtData: JwtDataAdministratorDto;

    try {
      jwtData =
        await this.jwtService.verifyAsync<JwtDataAdministratorDto>(token);
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Token expired');
    }

    if (jwtData.ip !== req.ip?.toString()) {
      throw new UnauthorizedException('Bad token found');
    }

    if (jwtData.ua !== req.headers['user-agent']) {
      throw new UnauthorizedException('Bad token found');
    }

    let admin: Administrator | null;

    try {
      admin = await this.prisma.administrator.findUnique({
        where: { administratorId: jwtData.administratorId },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }

    if (!admin) {
      throw new UnauthorizedException('Account not found');
    }

    if (jwtData.username !== admin.username) {
      throw new UnauthorizedException('Token not valid');
    }

    next();
  }
}
