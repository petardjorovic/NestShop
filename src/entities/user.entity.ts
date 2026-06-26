import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 25, unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash', length: 128 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 64 })
  forename: string;

  @Column({ type: 'varchar', length: 64 })
  surname: string;

  @Column({ type: 'varchar', name: 'phone_number', length: 24, unique: true })
  phoneNumber: number;

  @Column({ type: 'text', name: 'postal_address' })
  postalAddress: string;
}
