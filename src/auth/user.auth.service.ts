import { ConflictException, Injectable } from '@nestjs/common';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { VerificationTokenService } from 'src/verification-token/verification-token.service';
import { VerificationType } from 'src/generated/prisma/enums';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserAuthService {
  private readonly frontendUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
  }

  async register(data: UserRegistrationDto) {
    // normalize email address
    const email = data.email.trim().toLowerCase();

    // check if user email already exists
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // check if user phone number already exists
    const existingPhone = await this.userService.findByPhoneNumber(
      data.phoneNumber,
    );

    if (existingPhone) {
      throw new ConflictException('Phone already exists');
    }

    // hash user password
    const passwordHash = await argon2.hash(data.password);

    // create user
    const user = await this.userService.createUser({
      email,
      passwordHash,
      forename: data.forename,
      surname: data.surname,
      phoneNumber: data.phoneNumber,
      postalAddress: data.postalAddress,
    });

    // create verification token
    const token = await this.verificationTokenService.create(
      user.userId,
      VerificationType.EMAIL_VERIFICATION,
      24,
    );

    const url = this.createVerificationUrl(token);

    // send email
    await this.mailService.sendVerifyEmail(user.forename, user.email, url);
  }

  private createVerificationUrl(token: string): string {
    return `${this.frontendUrl}/verify-email?token=${token}`;
  }
}
