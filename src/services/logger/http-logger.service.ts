// src/services/logger/http-logger.service.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import pinoHttp, { HttpLogger, Options as PinoHttpOptions } from 'pino-http';
import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerService {
  private httpLogger: HttpLogger;

  constructor(private logger: LoggerService) {
    this.httpLogger = this.createHttpLogger();
  }

  getMiddleware(): HttpLogger {
    return this.httpLogger;
  }

  private createHttpLogger(): HttpLogger {
    return pinoHttp({
      logger: this.logger.getPinoLogger(),
      genReqId: (req: IncomingMessage) => (req as any).id || randomUUID(),
      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} completed with ${res.statusCode}`;
      },
      customErrorMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} failed with ${res.statusCode}`;
      },
      serializers: {
        req: this.serializeRequest,
        res: this.serializeResponse,
      },
      autoLogging: {
        ignore: (req) =>
          req.url?.includes('/health') || req.url?.includes('/metrics'),
      },
    } as PinoHttpOptions);
  }

  private serializeRequest(req: IncomingMessage) {
    return {
      id: (req as any).id,
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
      },
    };
  }

  private serializeResponse(res: ServerResponse) {
    return {
      statusCode: res.statusCode,
    };
  }
}
