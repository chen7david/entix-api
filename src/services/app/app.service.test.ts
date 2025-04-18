import 'reflect-metadata';
import { AppService } from '@src/services/app/app.service';
import { AppServiceOptions } from '@src/services/app/app.types';

describe('AppService', () => {
  let mockOptions: AppServiceOptions;
  let beforeRoutesSpy: jest.Mock;
  let afterRoutesSpy: jest.Mock;

  beforeEach(() => {
    beforeRoutesSpy = jest.fn();
    afterRoutesSpy = jest.fn();

    mockOptions = {
      controllers: ['TestController'],
      beforeRoutes: beforeRoutesSpy,
      afterRoutes: afterRoutesSpy,
    };
  });

  describe('constructor', () => {
    it('should create a new AppService instance', () => {
      const appService = new AppService(mockOptions);
      expect(appService).toBeInstanceOf(AppService);
      expect(beforeRoutesSpy).toHaveBeenCalled();
      expect(afterRoutesSpy).toHaveBeenCalled();
    });

    it('should throw an error if options is not provided', () => {
      expect(() => new AppService(undefined as any)).toThrow(
        'AppServiceOptions is required'
      );
    });

    it('should throw an error if beforeRoutes is not a function', () => {
      mockOptions.beforeRoutes = 'not a function' as any;
      expect(() => new AppService(mockOptions)).toThrow(
        'beforeRoutes must be a function'
      );
    });

    it('should throw an error if afterRoutes is not a function', () => {
      mockOptions.afterRoutes = 'not a function' as any;
      expect(() => new AppService(mockOptions)).toThrow(
        'afterRoutes must be a function'
      );
    });
  });

  describe('getApp', () => {
    it('should return the Express application', () => {
      const appService = new AppService(mockOptions);
      const app = appService.getApp();
      expect(app).toBeDefined();
      expect(app.listen).toBeDefined(); // Express apps have a listen method
    });
  });

  describe('applyRoutes', () => {
    it('should throw an error if controllers is not provided', () => {
      const appService = new AppService(mockOptions);
      const optionsWithoutControllers = {
        ...mockOptions,
        controllers: undefined,
      };

      expect(() => {
        // Using any to bypass TypeScript's type checking for this test
        appService.applyRoutes(optionsWithoutControllers as any);
      }).toThrow('At least one controller is required');
    });

    it('should throw an error if controllers is an empty array', () => {
      const appService = new AppService(mockOptions);
      const optionsWithEmptyControllers = { ...mockOptions, controllers: [] };

      expect(() => {
        appService.applyRoutes(optionsWithEmptyControllers);
      }).toThrow('At least one controller is required');
    });
  });
});
