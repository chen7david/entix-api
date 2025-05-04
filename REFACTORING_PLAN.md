# Refactoring Plan: Standardizing on routing-controllers

This document outlines the comprehensive plan to refactor the codebase to standardize on the routing-controllers decorator pattern for all API endpoints, similar to how the user controller is implemented.

## 1. Overview of Changes

We've refactored the `TenantController` to use the routing-controllers decorator pattern, which provides several benefits:

- **Consistency**: All controllers use the same approach
- **Simplicity**: Decorators provide a cleaner, more declarative API
- **Type Safety**: Parameter and body validation is tightly coupled with the handler
- **Documentation**: OpenAPI documentation is directly attached to endpoints

## 2. Refactoring Steps

### 2.1 Remove Custom Router Implementation

1. **Remove any custom router implementation files**:

   - `src/shared/types/api.type.ts` (if no longer needed)
   - `src/shared/utils/api.util.ts` (if no longer needed)
   - Any router registration code that isn't using routing-controllers

2. **Remove router utility code**:
   - The `extractRequest` function in `src/shared/utils/router.util.ts` is no longer needed

### 2.2 Update OpenAPI Integration

1. **Update Schema Registration**:

   - Keep the existing schema registration functions in DTO files
   - Ensure all DTOs are properly registered with OpenAPI

2. **Update OpenApiService**:
   - The existing OpenApiService correctly uses the routing-controllers metadata
   - No changes needed here, as it already extracts OpenAPI specs from controller decorators

### 2.3 Update Middleware

1. **Ensure middleware is compatible**:
   - All middleware should implement `ExpressMiddlewareInterface`
   - Update the validation middleware to work with the routing-controllers decorators

### 2.4 Controller Updates

For each controller in the codebase that doesn't use routing-controllers:

1. **Add Class Decorators**:

   - `@JsonController('/path')` - Sets the base path for all routes
   - `@Injectable()` - Ensures the controller can be injected

2. **Add Method Decorators**:

   - `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` - Set HTTP methods
   - `@UseBefore()` - For middleware
   - `@HttpCode()` - For custom status codes
   - `@OnUndefined()` - For void returns

3. **Add Parameter Decorators**:

   - `@Body()` - For request body
   - `@Param()` - For URL parameters
   - `@QueryParams()` - For query parameters
   - `@Req()` - For the request object (use sparingly)

4. **Add OpenAPI Decorators**:
   - `@OpenAPI()` - For endpoint documentation
   - `@ResponseSchema()` - For response type documentation

### 2.5 Testing Updates

1. **Update controller tests**:

   - Use `useExpressServer` to set up test controllers
   - Test decorators and parameter binding directly

2. **Update integration tests**:
   - Ensure integration tests are using the proper routing-controllers setup

## 3. Implementation Priorities

1. **High Priority**:

   - Fix any broken endpoints after refactoring
   - Update test suite to cover all controllers

2. **Medium Priority**:

   - Document new patterns for future development
   - Add route validation to ensure all paths are consistent

3. **Low Priority**:
   - Refactor OpenAPI schema registration for better maintainability
   - Consider automated generation of client SDKs based on controllers

## 4. Benefits of Standardization

1. **Developer Experience**:

   - Consistent patterns across the codebase
   - Clear separation of concerns
   - Simplified endpoint implementation

2. **Documentation**:

   - Automatic OpenAPI documentation from code
   - Documentation is co-located with implementation

3. **Maintainability**:
   - Reduced boilerplate code
   - Type-safe parameter handling
   - Centralized middleware application

## 5. Example Conversion

### Before:

```typescript
export class SomeController {
  getRouterOptions(registry: OpenAPIRegistry): RouterOptions {
    return {
      basePath: '/resources',
      endpoints: [
        {
          method: 'get',
          path: '/',
          handler: async (req) => {
            // Implementation
            return { status: 200, body: data };
          },
          // Documentation...
        },
      ],
    };
  }
}
```

### After:

```typescript
@JsonController('/api/v1/resources')
export class SomeController {
  @Get('/')
  @OpenAPI({
    summary: 'Get resources',
    // Documentation...
  })
  @ResponseSchema('ResourceDto', { isArray: true })
  async getAll(): Promise<ResourceDto[]> {
    // Implementation
    return data;
  }
}
```

## 6. Timeline

1. **Phase 1** (1-2 days):

   - Refactor TenantController (completed)
   - Update tests for TenantController
   - Document the new pattern

2. **Phase 2** (3-5 days):

   - Refactor remaining controllers
   - Update all tests
   - Remove deprecated code

3. **Phase 3** (1-2 days):
   - Final testing and validation
   - Update documentation
   - Clean up any remaining issues

## 7. Future Considerations

1. **Versioning**: Ensure API versioning strategy is consistent with routing-controllers
2. **Authentication**: Standardize auth middleware with routing-controllers
3. **Rate Limiting**: Integrate rate limiting with routing-controllers
4. **Error Handling**: Standardize error handling across all controllers
