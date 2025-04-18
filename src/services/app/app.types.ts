import { Action } from 'routing-controllers';
import express from 'express';

export type AppServiceOptions = {
  routePrefix?: string;
  controllers: string[] | Function[] | undefined;
  middlewares?: string[] | Function[] | undefined;
  currentUserChecker?: (action: Action) => Promise<any> | any;
  authorizationChecker?: (action: Action) => Promise<any> | any;
  beforeRoutes: (app: express.Application) => void;
  afterRoutes: (app: express.Application) => void;
};
