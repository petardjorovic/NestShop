import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {}

  getById() {}

  add() {}

  edit() {}
}
