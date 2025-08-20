import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl } = req;
        const started = Date.now();

        this.logger.log(`→ ${method} ${originalUrl}`);

        return next.handle().pipe(
            tap({
                next: () => {
                    const ms = Date.now() - started;
                    this.logger.log(`← ${method} ${originalUrl} ${ms}ms`);
                },
                error: (err) => {
                    const ms = Date.now() - started;
                    this.logger.error(`× ${method} ${originalUrl} ${ms}ms :: ${err?.message || err}`);
                },
            }),
        );
    }
}