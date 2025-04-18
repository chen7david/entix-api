import { Action, RoutingControllersOptions } from 'routing-controllers';
import express from 'express';

export type AppServiceOptions = {
  routePrefix?: string;
  controllers: RoutingControllersOptions['controllers'];
  middlewares?: RoutingControllersOptions['middlewares'];
  currentUserChecker?: (action: Action) => Promise<any> | any;
  authorizationChecker?: (action: Action) => Promise<any> | any;
  beforeRoutes: (app: express.Application) => void;
  afterRoutes: (app: express.Application) => void;
};
