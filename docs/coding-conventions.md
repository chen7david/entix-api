# Coding Conventions

## 1. Naming Conventions

- **Classes and Interfaces**: Use PascalCase for class and interface names. This helps distinguish them from regular functions and variables.

  - Example: `UserController`, `IUserService`

- **Functions and Variables**: Use camelCase for function and variable names. This is a common convention in JavaScript and TypeScript.

  - Example: `getUserById`, `userList`

- **Enums**: Use PascalCase for enum names and their members. This indicates that they are a distinct type and helps in differentiating them from regular constants.

  - Example:
    ```typescript
    enum UserRole {
      ADMIN,
      USER,
      MODERATOR,
    }
    ```

- **Constants**: Use UPPER_SNAKE_CASE for constant values. This makes it clear that these values should not change.
  - Example: `const MAX_USERS = 100;`

## 2. Code Comments

- **Function Comments**: Use JSDoc style comments to describe the purpose of functions, their parameters, and return values.

  ```typescript
  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object.
   */
  function getUserById(id: string): User {
    // function implementation
  }
  ```

- **Class Comments**: Describe the purpose of the class and its main functionalities.
  ```typescript
  /**
   * Controller for managing user-related operations.
   */
  class UserController {
    // class implementation
  }
  ```

## 3. Layered Architecture

- **Controllers**: Handle incoming requests, validate data using middleware, and call services to perform business logic. They should not contain business logic themselves.
- **Services**: Contain the business logic of the application. They interact with repositories to fetch or manipulate data. Services should throw errors defined in `@src/utils/error.util.ts` to be handled globally.

- **Repositories**: Abstract data access logic. They should expose methods without exposing any database-specific implementations. This allows for easier changes in the underlying data storage without affecting the rest of the application.

## 4. Data Transfer Objects (DTOs) and Domain Models

- **DTOs**: Used to transfer data between layers. They help in validating and transforming data before it reaches the service layer.
- **Domain Models**: Represent the core entities of the application. They encapsulate the business logic and rules.

- **Transformers**: Used to convert between DTOs and domain models. This is similar to how data might be transformed in CSV processing. They ensure that the data passed between layers is in the correct format.

## 5. Validation and Error Handling

- **Validation**: All incoming data should be validated in the controller layer using middleware before being processed. This ensures that only valid data reaches the service layer.

- **Error Handling**: Use the error classes defined in `@src/utils/error.util.ts` to handle errors consistently across the application. This allows for a centralized error handling mechanism in `@app.ts`.

## 6. Testing

- **Naming Tests**: Use descriptive names for test cases that clearly indicate what functionality is being tested.
- **Writing Tests**: Every new feature or code change should have accompanying tests. This ensures that the codebase remains stable and that new changes do not introduce regressions.

- **Test Structure**: Organize tests in a way that mirrors the structure of the application. This makes it easier to find and maintain tests.

## 7. Separation of Concerns

- **Why Use Layers**: Separating concerns into layers (controllers, services, repositories) allows for better organization, easier testing, and the ability to swap out implementations without affecting other parts of the application.

- **Example of Layer Interaction**:
  - A controller receives a request and validates it.
  - If valid, it calls a service to perform business logic.
  - The service interacts with a repository to fetch or save data.
  - Errors are thrown from the service and handled globally.

## 8. Conclusion

Following these coding conventions will help maintain a clean, organized, and scalable codebase. Consistency in naming, structure, and documentation will make it easier for developers to understand and contribute to the project.
