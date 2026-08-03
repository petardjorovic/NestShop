import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

@Injectable()
export class CsrfService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('app.csrfSecret');
  }

  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return createHmac('sha256', this.secret).update(token).digest('hex');
  }

  verifyToken(csrfTokenHash: string, csrfToken: string): boolean {
    const candidateHash = this.hashToken(csrfToken);

    const expected = Buffer.from(csrfTokenHash, 'hex');
    const actual = Buffer.from(candidateHash, 'hex');

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  }
}
