import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface ErrorResponse {
  statusCode: number;
  message: any;
  error: string;
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      success: false,
      status,
      path: request.url,
      message:
        exception instanceof HttpException
          ? (exception.getResponse() as ErrorResponse)?.message
          : 'Something Went Wrong',
    });
    Logger.error('error', exception);
  }
}
