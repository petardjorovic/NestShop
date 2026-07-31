import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { VerificationType } from 'src/generated/prisma/enums';

@Injectable()
export class UserAuthService {
  private readonly frontendUrl: string;
  private readonly logger = new Logger(UserAuthService.name);

  constructor(
    private readonly userService: UserService,
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

    const phoneNumber = data.phoneNumber.trim();

    // check if user phone number already exists
    const existingPhone = await this.userService.findByPhoneNumber(phoneNumber);

    if (existingPhone) {
      throw new ConflictException('Phone already exists');
    }

    // hash user password
    const passwordHash = await argon2.hash(data.password);

    // create user and verification token
    const { user, token } =
      await this.userService.createUserWithVerificationToken({
        email,
        passwordHash,
        forename: data.forename,
        surname: data.surname,
        phoneNumber,
        postalAddress: data.postalAddress,
        expiresInHours: 24,
        verificationType: VerificationType.EMAIL_VERIFICATION,
      });

    const url = this.createVerificationUrl(token);

    // send email
    try {
      await this.mailService.sendVerifyEmail(user.forename, user.email, url);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private createVerificationUrl(token: string): string {
    return `${this.frontendUrl}/verify-email?token=${token}`;
  }
}
