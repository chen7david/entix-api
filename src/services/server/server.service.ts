import { env } from '@src/config/env.config';
import express from 'express';
import http from 'http';
import os from 'os';

export type ServerServiceOptions = {
  app: express.Application;
  port: number;
  beforeShutdown?: () => void;
  onError?: (error: Error) => void;
  onListening?: ({ port, ip }: { port: number; ip: string }) => void;
};

export class ServerService {
  private app: express.Application;
  private server: http.Server;
  private port: number;

  constructor(options: ServerServiceOptions) {
    this.app = options.app;
    this.port = options.port;
    this.server = http.createServer(this.app);

    this.server.on('SIGTERM', () => {
      if (options.beforeShutdown) {
        options.beforeShutdown();
      }
    });

    this.server.on('SIGINT', () => {
      if (options.beforeShutdown) {
        options.beforeShutdown();
      }
    });

    this.server.on('error', (error) => {
      if (options.onError) {
        options.onError(error);
      }
    });

    this.server.on('listening', () => {
      if (options.onListening) {
        options.onListening({
          port: this.port,
          ip: this.getServerIp(),
        });
      }
    });
  }

  public start() {
    this.server.listen(env.PORT);
  }

  public getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const key in interfaces) {
      const iface = interfaces[key];
      if (!iface) continue;
      for (const alias of iface) {
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal
        ) {
          return alias.address;
        }
      }
    }
    return 'localhost';
  }
}
