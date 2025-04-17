export type AppServiceOptions = {
  beforeRoutes: (app: express.Application) => void;
  afterRoutes: (app: express.Application) => void;
};
