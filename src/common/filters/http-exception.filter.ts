import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let body: Record<string, unknown>;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      body =
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              message: exceptionResponse,
            }
          : (exceptionResponse as Record<string, unknown>);
    } else {
      let errorMessage: string;

      if (exception instanceof Error) {
        errorMessage = exception.stack ?? exception.message;
      } else {
        try {
          errorMessage = JSON.stringify(exception) ?? String(exception);
        } catch {
          errorMessage = String(exception);
        }
      }
      this.logger.error(errorMessage);

      body = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }

    response.status(status).json({
      ...body,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
