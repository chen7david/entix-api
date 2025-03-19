declare module '@newrelic/pino-enricher' {
  import { LoggerOptions } from 'pino';
  export default function nrPino(options?: LoggerOptions): LoggerOptions;
}
