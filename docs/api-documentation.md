# API Documentation: OpenAPI & Postman Integration

## Overview

This project uses [`routing-controllers-openapi`](https://www.npmjs.com/package/routing-controllers-openapi) to automatically generate an [OpenAPI 3.0](https://www.openapis.org/) specification from your TypeScript controllers. This ensures your API documentation is always up-to-date and consistent with your codebase.

The OpenAPI spec is served at [`/api/openapi.json`](../src/shared/services/app/app.service.ts) and is automatically converted to a Postman collection in the CI/CD pipeline using [`openapi-to-postmanv2`](https://www.npmjs.com/package/openapi-to-postmanv2). This means your Postman docs are always in sync with your code and your OpenAPI comments will appear in Postman.

---

## How to Document Your API

### 1. Annotate Controllers and Routes

Use the `@OpenAPI` decorator from `routing-controllers-openapi` to add rich documentation to your endpoints. Place the decorator above each route handler. You can specify:

- `summary`: Short description of the endpoint
- `description`: Detailed explanation
- `parameters`: Path/query/header params
- `requestBody`: Schema for request body
- `responses`: Possible responses, status codes, and schemas
- `tags`: Logical grouping for endpoints

**Example:**

```ts
import { OpenAPI } from 'routing-controllers-openapi';

@Get('/')
@OpenAPI({
  summary: 'Get all users',
  description: 'Returns a list of all users in the system.',
  responses: {
    '200': {
      description: 'A list of users',
      content: {
        'application/json': {
          schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
        },
      },
    },
  },
  tags: ['Users'],
})
async getAll(): Promise<User[]> { /* ... */ }
```

> **Tip:** Keep your summaries concise and your descriptions clear. Always document all parameters and possible responses.

### 2. Keep Documentation Close to Code

- Place all documentation decorators directly above the route handler.
- Update the documentation whenever you change the route's behavior, parameters, or response.
- Use TSDoc comments above your methods for additional context (these are for developers, not OpenAPI consumers).

### 3. Use Schema References

- Reference DTOs or schemas in your OpenAPI docs for request and response bodies.
- If using Zod or other runtime schemas, consider using a Zod-to-OpenAPI tool for advanced schema generation.

---

## How the CI/CD Pipeline Keeps Docs Up to Date

1. **OpenAPI Spec Generation**: The `/api/openapi.json` endpoint always reflects the current state of your controllers and their documentation.
2. **Postman Collection Generation**: The pipeline runs `openapi-to-postmanv2` to convert the OpenAPI spec to a Postman collection.
3. **Automatic Updates**: Any changes to your route documentation (via `@OpenAPI` or code changes) are automatically reflected in both the OpenAPI spec and the Postman collection.

### How Your Comments Show in Postman

- The `summary` and `description` fields from your `@OpenAPI` decorators appear as endpoint descriptions in Postman.
- Parameter and response documentation is visible in the Postman UI, making it easy for consumers to understand how to use your API.

---

## Best Practices

- **Be explicit**: Always document all parameters, request bodies, and responses.
- **Use tags**: Group related endpoints for easier navigation.
- **Keep it DRY**: Reference shared schemas/components where possible.
- **Review regularly**: Make documentation updates part of your code review process.
- **Automate**: Rely on the CI/CD pipeline to keep your docs and Postman collection in sync.

---

## Helpful Resources

- [routing-controllers-openapi (npm)](https://www.npmjs.com/package/routing-controllers-openapi)
- [OpenAPI Initiative](https://www.openapis.org/)
- [openapi-to-postmanv2](https://www.npmjs.com/package/openapi-to-postmanv2)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)

---

## Known Limitations

- `@ResponseSchema` requires a runtime class, not a TypeScript type. If you use Zod or other runtime schemas, you may need a Zod-to-OpenAPI tool for full schema support.
- Some advanced OpenAPI features (e.g., polymorphism, oneOf) may require manual tweaks or custom decorators.

---

## Example: Annotated User Controller

See [`src/domains/user/user.controller.ts`](../src/domains/user/user.controller.ts) for a fully annotated example following these best practices.
