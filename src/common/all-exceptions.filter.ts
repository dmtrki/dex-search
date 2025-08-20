import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const isHttp = exception instanceof HttpException;
        const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = isHttp ? (exception as HttpException).message : 'Internal server error';

        this.logger.error(
            `Exception on ${req.method} ${req.originalUrl} :: ${message}`,
            (exception as any)?.stack,
        );

        res.status(status).json({
            statusCode: status,
            path: req.originalUrl,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}