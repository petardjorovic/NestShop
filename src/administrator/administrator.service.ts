import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entities/administrator.entity';
import { Repository } from 'typeorm';
// import { CreateAdministratorDto } from './dtos/create-administrator.dto';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
  ) {}

  getAll(): Promise<Administrator[]> {
    return this.administratorRepository.find();
  }

  async getById(administratorId: number): Promise<Administrator | null> {
    return this.administratorRepository.findOne({ where: { administratorId } });
  }
  //TODO create admin
  // async create(data: CreateAdministratorDto) {
  //   const existingAdministrator = await this.administratorRepository.findOne({
  //     where: { username: data.username },
  //   });
  // }
}
