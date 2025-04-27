'use strict';
console.log(process.env.NEW_RELIC_LICENSE_KEY);
/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names as they should appear in the New Relic UI.
   * If you need to specify multiple apps in a single agent, use the app_name array.
   */
  app_name: [process.env.SERVICE_NAME || 'prod-entix-api'],

  /**
   * Your New Relic license key.
   * This is required to connect to New Relic's services.
   */
  license_key: 'a3348d7e1dfaa72f6a6f90fdc0f8556fFFFFNRAL',

  /**
   * This setting determines whether the agent attempts to connect to
   * New Relic's servers at startup.
   */
  agent_enabled: process.env.NODE_ENV === 'production',

  /**
   * The transaction tracer captures deep information about slow
   * transactions and sends this to the UI on a periodic basis.
   */
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
    explain_threshold: 500,
  },

  /**
   * Log level for the New Relic agent.
   * Options are: 'trace', 'debug', 'info', 'warn', 'error' (Default: 'info')
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
  },

  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  /**
   * When distributed tracing is enabled, sets the name of the remote application
   * that calls this application.
   */
  distributed_tracing: {
    enabled: true,
  },
};
