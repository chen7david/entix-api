# Prettier Configuration

This document outlines the Prettier configuration used in the project.

## Configuration Options

The Prettier configuration is defined in the `package.json` file under the `prettier` key. Here are the options used:

- **semi**: `true` - Adds a semicolon at the end of every statement.
- **singleQuote**: `true` - Uses single quotes instead of double quotes.
- **tabWidth**: `2` - Sets the number of spaces per indentation level.
- **trailingComma**: `"es5"` - Adds a trailing comma wherever possible in ES5 (objects, arrays, etc.).
- **printWidth**: `80` - Specifies the line length that the printer will wrap on.

## Usage

To format your code using Prettier, run the following command:

```bash
npm run format
```

This will apply the Prettier formatting rules to your codebase.
