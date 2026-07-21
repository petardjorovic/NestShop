import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateEmailResponseSuccess, Resend } from 'resend';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import { EmailSubject } from './enums/email-subject.enum';
import { EmailTemplate } from './enums/email-template.enum';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  async onModuleInit() {
    await this.registerPartials();
  }
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      configService.getOrThrow<string>('mail.resendApiKey'),
    );
  }

  sendVerifyEmail(
    name: string,
    to: string,
    verifyUrl: string,
  ): Promise<CreateEmailResponseSuccess> {
    return this.sendEmail(EmailTemplate.VERIFY, EmailSubject.VERIFY, to, {
      name,
      verifyUrl,
      expiresIn: '24 hours',
    });
  }

  sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<CreateEmailResponseSuccess> {
    return this.sendEmail(EmailTemplate.RESET, EmailSubject.RESET, to, {
      name,
      resetUrl,
      expiresIn: '1 hour',
    });
  }

  sendWelcomeEmail(
    to: string,
    name: string,
    appUrl: string,
  ): Promise<CreateEmailResponseSuccess> {
    return this.sendEmail(EmailTemplate.WELCOME, EmailSubject.WELCOME, to, {
      name,
      appUrl,
    });
  }

  sendOrderConfirmationEmail() {}

  private async renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );

    const source = await fs.readFile(templatePath, 'utf8');

    const template = Handlebars.compile(source);

    return template(context);
  }

  private async registerPartials(): Promise<void> {
    const partialsPath = path.join(__dirname, 'templates', 'partials');

    const partials = ['layout', 'header', 'footer', 'button'];

    for (const partial of partials) {
      const source = await fs.readFile(
        path.join(partialsPath, `${partial}.hbs`),
        'utf8',
      );

      Handlebars.registerPartial(partial, source);
    }
  }

  private async sendEmail(
    template: EmailTemplate,
    subject: EmailSubject,
    to: string,
    context: Record<string, unknown>,
  ): Promise<CreateEmailResponseSuccess> {
    const html = await this.renderTemplate(template, {
      ...context,
      year: new Date().getFullYear(),
    });

    const { data, error } = await this.resend.emails.send({
      from: this.configService.getOrThrow<string>('mail.from'),
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error(
        `Failed to send ${template} email to ${to}`,
        JSON.stringify(error),
      );
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
