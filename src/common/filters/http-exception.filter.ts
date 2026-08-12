import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      body =
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              message: exceptionResponse,
            }
          : (exceptionResponse as Record<string, unknown>);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.getPrismaStatus(exception);

      body = {
        statusCode: status,
        message: this.getPrismaMessage(exception),
      };

      this.logger.warn(`Prisma error ${exception.code}: ${exception.message}`);
    } else {
      this.logger.error(this.getUnknownErrorMessage(exception));

      body = {
        statusCode: status,
        message: 'Internal server error',
      };
    }

    response.status(status).json({
      ...body,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }

  private getPrismaStatus(
    exception: Prisma.PrismaClientKnownRequestError,
  ): number {
    switch (exception.code) {
      case 'P2002':
      case 'P2003':
        return HttpStatus.CONFLICT;

      case 'P2025':
        return HttpStatus.NOT_FOUND;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (exception.code) {
      case 'P2002':
        return 'Resource already exists';

      case 'P2003':
        return 'Related resource constraint failed';

      case 'P2025':
        return 'Resource not found';

      default:
        return 'Database operation failed';
    }
  }

  private getUnknownErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.stack ?? exception.message;
    }

    try {
      return JSON.stringify(exception) ?? String(exception);
    } catch {
      return String(exception);
    }
  }
}
