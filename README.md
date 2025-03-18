# entix-api

#### Scripts

- `dev`: runs application in development mode, with hot reload on save.
- `build`: compiles the typescript code to javascript and puts that in a dist folder
- `format`: formats the typescript code in line with the prettier config defined in the `.prettierrc` file

#### Tools

dev-setup:

- `tsconfig-paths`: maps path aliases to relative paths during runtime
- `tsc-alias`: maps path aliases to relative paths during build time

#### Getting Started - Dev Containers

Prerequisites:

- Docker

Dev containers provide us with a simple setup dev enviroment to get started. This workspace includes a postgres db with the following default credentials:

- user: postgres
- password: postgres
- database: postgres

To start the dev-container you on a mac you need to holdown `shift` + `command` + `p`, then choose Dev Containers: `Rebuild Container`
