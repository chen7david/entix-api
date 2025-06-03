import { Injectable } from '@core/utils/di.util';

@Injectable()
export class MockConfigService {
  constructor(private config: Record<string, unknown> = {}) {}

  get(key: string): unknown {
    return this.config[key];
  }

  set(key: string, value: unknown): void {
    this.config[key] = value;
  }
}
