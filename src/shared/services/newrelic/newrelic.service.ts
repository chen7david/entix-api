import { Injectable } from '@shared/utils/ioc.util';
import { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';
import { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Type definition for the New Relic API
 * This is a minimal interface that covers just what we need
 */
interface NewRelicApi {
  addCustomAttributes(attributes: Record<string, string | number | boolean>): void;
  recordCustomEvent(eventType: string, attributes: Record<string, string | number | boolean>): void;
  // Add other methods as needed
}

/**
 * Service to manage the New Relic APM integration
 * This service handles initialization and provides utilities for working with New Relic
 */
@Injectable()
export class NewRelicService {
  private readonly enabled: boolean;
  private newrelic: NewRelicApi | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    const nodeEnv = this.configService.get('NODE_ENV') as NodeEnv;
    this.enabled = nodeEnv === NodeEnv.PRODUCTION;

    // Initialize New Relic if in production
    if (this.enabled) {
      try {
        // Dynamically load New Relic to avoid issues in non-production environments
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.newrelic = globalThis.require?.('newrelic');
        console.log(this.newrelic);
        const logger = this.loggerService.child({ service: 'NewRelicService' });
        logger.info('New Relic APM initialized');
      } catch (err) {
        const logger = this.loggerService.child({ service: 'NewRelicService' });
        logger.warn({ err }, 'Failed to initialize New Relic APM');
        this.enabled = false;
      }
    }
  }

  /**
   * Check if New Relic is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.newrelic !== null;
  }

  /**
   * Get the New Relic instance
   * Returns null if New Relic is not enabled or failed to initialize
   */
  getNewRelic(): NewRelicApi | null {
    return this.newrelic;
  }

  /**
   * Add custom attributes to the current New Relic transaction
   * Does nothing if New Relic is not enabled
   * @param attributes Key-value pairs to add as custom attributes
   */
  addCustomAttributes(attributes: Record<string, string | number | boolean>): void {
    if (this.isEnabled() && this.newrelic) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.newrelic.addCustomAttributes(attributes);
    }
  }

  /**
   * Record a custom New Relic event
   * Does nothing if New Relic is not enabled
   * @param eventType Name of the event type
   * @param attributes Event attributes
   */
  recordCustomEvent(
    eventType: string,
    attributes: Record<string, string | number | boolean>,
  ): void {
    if (this.isEnabled() && this.newrelic) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.newrelic.recordCustomEvent(eventType, attributes);
    }
  }
}
