# Getting Started

## Environment Setup

When using dev containers, the environment is automatically configured during container creation. The following steps are handled automatically:

1. Environment file creation - The `.env` file is automatically created from `.env.example` if it doesn't exist([1](https://code.visualstudio.com/docs/devcontainers/containers))
2. Dependencies installation - `npm install` is run automatically
3. Test initialization - `npm run test:init` is executed to set up the test environment

These automations are configured in our `devcontainer.json` through the following settings:

```json
{
  "postCreateCommand": "npm install && npm run test:init",
  "initializeCommand": "test -f .env || cp .env.example .env"
}
```
