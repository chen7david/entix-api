import { Injectable } from '@core/utils/di.util';
import { NodeEnv } from '@core/types/app.types';

@Injectable()
export class MockEnvService {
  private env: Record<string, unknown>;

  constructor(private mockEnv: Record<string, string> = {}) {
    this.env = mockEnv;
  }

  get(key: string): string | undefined {
    return this.mockEnv[key];
  }

  has(key: string): boolean {
    return key in this.mockEnv;
  }

  set(key: string, value: string): void {
    this.mockEnv[key] = value;
    this.env[key] = value;
  }

  getProcessEnv(): Record<string, string> {
    return this.mockEnv;
  }

  getEnvPath(_nodeEnv: NodeEnv): string {
    return './mocked-env-path';
  }

  loadEnv(_envPath: string): Record<string, unknown> {
    return this.mockEnv;
  }
}
