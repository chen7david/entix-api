# TypeScript Development Environment Setup

This guide provides a step-by-step installation process for setting up a TypeScript development environment. This project supports path aliases, so we will include the necessary packages to resolve these aliases at both compile and runtime.

## Understanding Compile, Run, and Design Time

- **Compile/build Time**: This is the phase where TypeScript code is converted into JavaScript. During this phase, the TypeScript compiler checks for type errors and generates the corresponding JavaScript files.
- **Run Time**: This is the phase when the JavaScript code is executed. At this point, the code is running in the environment (like Node.js), and any runtime errors will occur.
- **Design Time**: Design-time refers to the phase when you're actively writing and editing code in your development environment, such as Visual Studio Code (VS Code).

## Installation Steps

1. **Install Required Packages**

   To set up the TypeScript environment, run the following command in your terminal:

   ```bash
   npm install --save-dev \
     typescript \
     ts-node \
     tsconfig-paths \
     tsc-alias \
     nodemon
   ```

   - `typescript`: The TypeScript compiler.
   - `ts-node`: Allows TypeScript to be run directly in Node.js.
   - `tsconfig-paths`: Resolves path aliases in TypeScript at run time.
   - `tsc-alias`: Resolves path aliases during the build process.
   - `nodemon`: Automatically restarts the application when file changes are detected.

     **Path Alias Resolution Overview**

   | Time Phase  | Package                     | Description                                                          |
   | ----------- | --------------------------- | -------------------------------------------------------------------- |
   | Run Time    | `tsconfig-paths`            | Resolves path aliases in TypeScript at run time.                     |
   | Build Time  | `tsc-alias`                 | Resolves path aliases during the build process.                      |
   | Design Time | TypeScript Language Service | Provides real-time feedback and resolves path aliases in the editor. |

2. **Initialize TypeScript Configuration**

   Next, initialize your TypeScript configuration by running:

   ```bash
   npx tsc --init
   ```

   This command creates a `tsconfig.json` file in your project root, which you can customize according to your project's needs.

3. **Set Up TypeScript Path Aliases**

   To set up path aliases, you need to modify the `tsconfig.json` file. Add the following configuration:

   ```json
   {
     "compilerOptions": {
       "baseUrl": "./",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

   In this example, `@/*` is an alias for the `src` directory. You can adjust the paths according to your project structure.

4. **Create a Script for Running with Nodemon and tsconfig-paths**

   To run your application with `nodemon` and `tsconfig-paths`, add the following script to your `package.json`:

   ```json
   "scripts": {
     "start": "nodemon -r tsconfig-paths/register src/index.ts"
   }
   ```

   This command ensures that the path aliases are resolved when running your application.

5. **Setting Up Testing with Jest**

   When you set up testing with Jest, you will also need to add an entry for the path aliases in your Jest configuration. This ensures that tests can resolve the same path aliases used in your application code.

   Example Jest configuration in `jest.config.js`:

   ```javascript
   module.exports = {
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   ```

6. **Build Script with tsc-alias**

   To resolve path aliases during the build process, you can use `tsc-alias`. First, ensure it is installed (as shown in step 1). Then, add a build script to your `package.json`:

   ```json
   "scripts": {
     "build": "tsc && tsc-alias"
   }
   ```

   This command compiles your TypeScript code and resolves the path aliases in the output JavaScript files.

## Conclusion

By following these steps, you will have a fully functional TypeScript development environment with path alias support. Make sure to adjust the configurations according to your project's specific needs.
