import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';

@Injectable()
export class CognitoService {
  constructor(private readonly logger: LoggerService) {
    this.logger.component('CognitoService');
  }
}
