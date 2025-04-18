import { Application } from 'express';

/**
 * Information about the server's listening state
 */
export type ServerListeningInfo = {
  /** The port number the server is listening on */
  port: number;
  /** The IP address the server is bound to */
  ip: string;
};

/**
 * Configuration options for the ServerService
 */
export type ServerServiceOptions = {
  /** The Express application instance to serve */
  app: Application;
  /** The port number to listen on. Defaults to env.PORT if not specified */
  port: number;
  /** Handler called before server shutdown. Can be async */
  beforeShutdown?: () => void | Promise<void>;
  /** Handler called when server encounters an error */
  onError?: (error: Error) => void | Promise<void>;
  /** Handler called when server starts listening */
  onListening?: (info: ServerListeningInfo) => void | Promise<void>;
};
