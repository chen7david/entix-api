---
title: Introduction
---

# Introduction to Entix API

Entix API is a modern, TypeScript-based REST API built with Express.js and enhanced with several powerful technologies for robust, type-safe, and maintainable development.

## Core Technologies

- **Node.js & Express.js**: The foundation of our API server
- **TypeScript**: For type safety and enhanced developer experience
- **PostgreSQL**: Our primary database system
- **routing-controllers**: For declarative route definitions
- **TypeDI**: For dependency injection and better code organization
- **Zod**: For runtime type validation and schema definition
- **Pino**: For structured logging
- **Jest**: For comprehensive testing
- **Docker & Devcontainers**: For consistent development environments

## Key Features

- Type-safe development with TypeScript
- Dependency injection for better code organization
- Declarative routing with routing-controllers
- Schema validation with Zod
- Structured logging with Pino
- Containerized development environment
- Comprehensive testing setup
- Environment-based configuration

## Project Structure

```
src/
├── config/         # Configuration files
├── features/       # Feature modules
├── middleware/     # Express middleware
├── services/       # Shared services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── __tests__/     # Test files
├── app.ts         # Express app setup
└── server.ts      # Server entry point
```

## Getting Started

To get started with the project:

1. Check out the [Setup Guide](./setup/) for installation instructions
2. Review the [Environment Configuration](./setup/environment.md) for configuration details
3. Visit the [Development Guide](./setup/development.md) for development workflows
