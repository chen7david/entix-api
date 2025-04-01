/**
 * Configuration for creating the Express application with routing-controllers
 */
export type AppConfig = {
  /** Whether to enable CORS for the application */
  cors?: boolean;
  /** Whether to enable detailed logging for requests */
  detailedLogging?: boolean;
};
