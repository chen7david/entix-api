FROM mcr.microsoft.com/devcontainers/javascript-node:1-20

RUN apt-get update && apt-get install -y gimp

# Create and set permissions for node_modules directory
RUN mkdir -p /workspaces/entix-api/node_modules && \
    chown -R node:node /workspaces/entix-api/node_modules

USER node
# Install environment tools for all devs here