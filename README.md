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

#### Conding Conventions: (Code of Conduct)

`enum`: We use uppercase for the keys, the argument being that we symanticaly convey that they are constants and their values can not be changed.

```ts
enum ExampleEnum {
  SOME_KEY = 'some-value',
  SOME_OTHER_KEY = 'some-other-value',
}
```

`type`: we try to use types instead of interfaces where possible, the argument being that types offer more flexibility and we generally do not encourage declaration merging for readabiliy and maintainability reasons.

Prerequisites:
